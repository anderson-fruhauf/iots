#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <cstdio>

#include "app_config.h"
#include "infra/mqtt.h"
#include "infra/wifi.h"
#include "secrets.h"

#ifndef MQTT_USE_TLS
#define MQTT_USE_TLS 0
#endif

#if MQTT_USE_TLS
#include <WiFiClientSecure.h>
static WiFiClientSecure mqttTransport;
#else
static WiFiClient mqttTransport;
#endif

static PubSubClient s_mqtt(mqttTransport);
static IPAddress mqttBrokerIp;
static bool mqttBrokerIpKnown = false;
static uint32_t lastMqttFailLogMs = 0;

void mqttBuildTelemetryTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId) {
  snprintf(out, outLen, "%s/%s/telemetry", topicPrefix, deviceId);
}

void mqttApplyServer() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  if (!mqttBrokerIpKnown) {
    if (WiFi.hostByName(MQTT_HOST, mqttBrokerIp)) {
      mqttBrokerIpKnown = true;
      Serial.printf("MQTT DNS: %s -> %s\n", MQTT_HOST, mqttBrokerIp.toString().c_str());
    } else {
      Serial.printf("MQTT DNS falhou: %s\n", MQTT_HOST);
    }
  }
  if (mqttBrokerIpKnown) {
    s_mqtt.setServer(mqttBrokerIp, MQTT_PORT);
  } else {
    s_mqtt.setServer(MQTT_HOST, MQTT_PORT);
  }
}

void mqttInitTransport() {
#if MQTT_USE_TLS
  mqttTransport.setInsecure();
  mqttTransport.setHandshakeTimeout(30);
#endif
  s_mqtt.setBufferSize(256);
  s_mqtt.setSocketTimeout(15);
}

void mqttReconnect(const char* deviceId) {
  if (WiFi.status() != WL_CONNECTED) {
    wifiSetup();
    if (WiFi.status() != WL_CONNECTED) {
      return;
    }
  }
  mqttApplyServer();
  char clientId[28];
  snprintf(clientId, sizeof(clientId), "iots-%s", deviceId);
  if (s_mqtt.connect(clientId)) {
    lastMqttFailLogMs = 0;
    Serial.println("MQTT conectado.");
    Serial.flush();
  } else {
    uint32_t now = millis();
    if (lastMqttFailLogMs == 0 ||
        now - lastMqttFailLogMs >= MQTT_FAIL_LOG_INTERVAL_MS) {
      lastMqttFailLogMs = now;
      Serial.printf(
          "MQTT falhou, rc=%d (%s:%d). Se errno 104: porta não chega ao Mosquitto "
          "(mapeamento TCP no EasyPanel / firewall).\n",
          s_mqtt.state(),
          MQTT_HOST,
          (int)MQTT_PORT);
      Serial.flush();
    }
  }
}

bool mqttConnected() { return s_mqtt.connected(); }

void mqttLoop() { s_mqtt.loop(); }

bool mqttPublish(const char* topic, const char* payload, bool retained) {
  return s_mqtt.publish(topic, payload, retained);
}
