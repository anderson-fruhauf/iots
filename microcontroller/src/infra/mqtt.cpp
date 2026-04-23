#include <Arduino.h>
#include <ArduinoJson.h>
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

void mqttBuildCommandTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId) {
  snprintf(out, outLen, "%s/%s/command", topicPrefix, deviceId);
}

void mqttBuildStateTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId) {
  snprintf(out, outLen, "%s/%s/state", topicPrefix, deviceId);
}

void mqttBuildSoilTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId) {
  snprintf(out, outLen, "%s/%s/soil", topicPrefix, deviceId);
}

void mqttBuildIrrigationTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId) {
  snprintf(out, outLen, "%s/%s/irrigation", topicPrefix, deviceId);
}

static void (*s_commandHandler)(const char* payload) = nullptr;

static void mqttInternalCallback(char* topic, byte* payload, unsigned int length) {
  static char buf[512];
  size_t n = length < sizeof(buf) - 1 ? length : sizeof(buf) - 1;
  memcpy(buf, payload, n);
  buf[n] = '\0';
  Serial.printf("MQTT RX topic=%s len=%u\n", topic, (unsigned)length);
  if (s_commandHandler) {
    s_commandHandler(buf);
  } else {
    Serial.println("MQTT: handler de comando nao registrado.");
  }
}

void mqttSetCommandHandler(void (*handler)(const char* payload)) {
  s_commandHandler = handler;
}

void mqttPublishLampState(
    const char* stateTopic,
    const char* deviceId,
    bool lampOn) {
  JsonDocument doc;
  doc["deviceId"] = deviceId;
  doc["lamp"] = lampOn;
  if (doc.overflowed()) {
    return;
  }
  char payload[128];
  const size_t n = serializeJson(doc, payload, sizeof(payload));
  if (n >= sizeof(payload)) {
    return;
  }
  mqttPublish(stateTopic, payload, true);
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
  /* Pacote MQTT (topo + payload) maior que o default 256; evita descartar PUBLISH. */
  s_mqtt.setBufferSize(512);
  s_mqtt.setSocketTimeout(15);
  s_mqtt.setKeepAlive(60);
  s_mqtt.setCallback(mqttInternalCallback);
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
    char commandTopic[72];
    mqttBuildCommandTopic(
        commandTopic,
        sizeof(commandTopic),
        MQTT_TOPIC_PREFIX,
        deviceId);
    /* QoS 1: alguns brokers entregam de forma mais confiável que QoS 0. */
    if (s_mqtt.subscribe(commandTopic, 1)) {
      Serial.printf("MQTT inscrito (QoS1): %s\n", commandTopic);
    } else {
      Serial.println("MQTT subscribe falhou.");
    }
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
