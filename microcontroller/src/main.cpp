#include <Arduino.h>
#include <Ticker.h>
#include <WiFi.h>

#include "app_config.h"

#if __has_include("secrets.h")
#include "secrets.h"
#else
#error "Copie include/secrets.example.h para include/secrets.h e defina WIFI_SSID, WIFI_PASS e MQTT_HOST."
#endif

#ifndef MQTT_TOPIC_PREFIX
#define MQTT_TOPIC_PREFIX "iots/device"
#endif

#include "device/device_id.h"
#include "infra/lamp.h"
#include "infra/led.h"
#include "infra/mqtt.h"
#include "infra/screen.h"
#include "infra/wifi.h"
#include "services/activity_signal.h"
#include "services/display_sensor.h"
#include "services/lamp_command.h"
#include "services/telemetry.h"
#include "services/soil_report.h"
#include "services/watering.h"
#include "infra/relay.h"
#include "infra/soil_moisture.h"

static char s_deviceId[20];
static char s_telemetryTopic[72];
static char s_soilTopic[72];
static Ticker timerTelemetry;
static Ticker timerSoil;
static Ticker timerScreen;
static Ticker timerIrrigation;

static void tickTelemetry() { activeSignal(telemetryTask)(); }

static void tickSoilReport() { activeSignal(soilReportTask)(); }

static void tickScreen() {
  screenSetNetwork(WiFi.status() == WL_CONNECTED, mqttConnected());
  displaySensorPoll();
  screenRefresh();
}

void setup() {
  Serial.begin(115200);
  delay(200);
  ledInit();
  lampInit();
  screenInit();
  setupSoilMoisture();
  setupRelay();

  wifiStaMode();
  deviceIdFromMac(s_deviceId, sizeof(s_deviceId));
  mqttBuildTelemetryTopic(
      s_telemetryTopic,
      sizeof(s_telemetryTopic),
      MQTT_TOPIC_PREFIX,
      s_deviceId);
  mqttBuildSoilTopic(
      s_soilTopic,
      sizeof(s_soilTopic),
      MQTT_TOPIC_PREFIX,
      s_deviceId);
  char stateTopic[72];
  mqttBuildStateTopic(
      stateTopic,
      sizeof(stateTopic),
      MQTT_TOPIC_PREFIX,
      s_deviceId);
  lampCommandInit(s_deviceId, stateTopic);

  telemetryInit(s_deviceId, s_telemetryTopic);
  soilReportInit(s_deviceId, s_soilTopic);
  Serial.printf("Device ID: %s\n", s_deviceId);
  Serial.printf("Tópico: %s\n", s_telemetryTopic);
  Serial.printf("Telemetria (temp/umidade) a cada %.0f s\n", TELEMETRY_INTERVAL_S);
  Serial.printf("Umidade do solo (MQTT) a cada %.0f s\n", SOIL_REPORT_INTERVAL_S);

  wifiSetup();
  mqttInitTransport();
  mqttApplyServer();
  mqttSetCommandHandler(lampCommandOnMqttPayload);
  mqttReconnect(s_deviceId);
  if (mqttConnected()) {
    lampCommandPublishCurrentState();
  }

  activeSignal(telemetryTask)();
  soilReportTask();
  tickScreen();
  timerTelemetry.attach(TELEMETRY_INTERVAL_S, tickTelemetry);
  timerSoil.attach(SOIL_REPORT_INTERVAL_S, tickSoilReport);
  timerScreen.attach(SCREEN_REFRESH_INTERVAL_S, tickScreen);
  irrigationInit();
  timerIrrigation.attach(SOIL_IRRIGATION_CHECK_INTERVAL_S, irrigationOnMinuteTick);
}

void loop() {
  irrigationService();

  if (WiFi.status() != WL_CONNECTED) {
    wifiSetup();
  }

  if (!mqttConnected()) {
    mqttReconnect(s_deviceId);
    delay(500);
    return;
  }
  mqttLoop();

  /* loop() do PubSubClient deve rodar com pouca latência para processar PUBLISH. */
  delay(25);
}
