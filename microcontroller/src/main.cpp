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
#include "infra/led.h"
#include "infra/mqtt.h"
#include "infra/wifi.h"
#include "services/activity_signal.h"
#include "services/telemetry.h"

static char deviceId[20];
static char telemetryTopic[72];
static Ticker timerTemp;

void telemetryTask() {
  TelemetryData telemetryData = getSensorData();
  telemetryPublish(telemetryData);
}

void setup() {
  Serial.begin(115200);
  delay(200);
  ledInit();

  wifiStaMode();
  deviceIdFromMac(deviceId, sizeof(deviceId));
  mqttBuildTelemetryTopic(
      telemetryTopic,
      sizeof(telemetryTopic),
      MQTT_TOPIC_PREFIX,
      deviceId);

  telemetryInit(deviceId, telemetryTopic);
  Serial.printf("Device ID: %s\n", deviceId);
  Serial.printf("Tópico: %s\n", telemetryTopic);
  Serial.printf("Telemetria a cada %.0f s\n", TELEMETRY_INTERVAL_S);

  wifiSetup();
  mqttInitTransport();
  mqttApplyServer();
  mqttReconnect(deviceId);

  activeSignal(telemetryTask)();
  timerTemp.attach(TELEMETRY_INTERVAL_S, activeSignal(telemetryTask));
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    wifiSetup();
  }

  if (!mqttConnected()) {
    mqttReconnect(deviceId);
    delay(500);
    return;
  }
  mqttLoop();
  delay(50);
}
