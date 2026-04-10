#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHTesp.h>

#if __has_include("secrets.h")
#include "secrets.h"
#else
#error "Copie include/secrets.example.h para include/secrets.h e defina WIFI_SSID, WIFI_PASS e MQTT_HOST."
#endif

#ifndef MQTT_USE_TLS
#define MQTT_USE_TLS 0
#endif

#if MQTT_USE_TLS
#include <WiFiClientSecure.h>
static WiFiClientSecure mqttTransport;
#else
static WiFiClient mqttTransport;
#endif

#ifndef MQTT_TOPIC_PREFIX
#define MQTT_TOPIC_PREFIX "iots/device"
#endif

static constexpr int LED_PIN = 2;
static constexpr int DHT_PIN = 23;

static constexpr uint32_t WIFI_CONNECT_MS = 20000;
static constexpr uint32_t PUBLISH_INTERVAL_MS = 60000;
static constexpr uint32_t MQTT_FAIL_LOG_INTERVAL_MS = 5000;

static PubSubClient mqtt(mqttTransport);
static DHTesp dht;

static char deviceId[20];
static char telemetryTopic[72];
static uint32_t lastMqttFailLogMs = 0;

static IPAddress mqttBrokerIp;
static bool mqttBrokerIpKnown = false;

/** Define mqtt.setServer: resolve DNS uma vez e imprime IP para diagnóstico. */
static void applyMqttServer() {
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
    mqtt.setServer(mqttBrokerIp, MQTT_PORT);
  } else {
    mqtt.setServer(MQTT_HOST, MQTT_PORT);
  }
}

static void setupWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_CONNECT_MS) {
    delay(250);
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED_PIN, HIGH);
    Serial.printf("WiFi OK, IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("WiFi falhou (timeout).");
    digitalWrite(LED_PIN, HIGH);
  }
}

static void reconnectMqtt() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWifi();
    if (WiFi.status() != WL_CONNECTED) {
      return;
    }
  }
  applyMqttServer();
  char clientId[28];
  snprintf(clientId, sizeof(clientId), "iots-%s", deviceId);
  if (mqtt.connect(clientId)) {
    lastMqttFailLogMs = 0;
    Serial.println("MQTT conectado.");
    Serial.flush();
  } else {
    // PubSubClient: -4 = timeout TCP (broker inalcançável, IP/porta, firewall ou broker parado)
    uint32_t now = millis();
    if (lastMqttFailLogMs == 0 ||
        now - lastMqttFailLogMs >= MQTT_FAIL_LOG_INTERVAL_MS) {
      lastMqttFailLogMs = now;
      Serial.printf(
          "MQTT falhou, rc=%d (%s:%d). Se errno 104: porta não chega ao Mosquitto "
          "(mapeamento TCP no EasyPanel / firewall).\n",
          mqtt.state(),
          MQTT_HOST,
          (int)MQTT_PORT);
      Serial.flush();
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  WiFi.mode(WIFI_STA);
  uint8_t mac[6];
  WiFi.macAddress(mac);
  snprintf(
      deviceId,
      sizeof(deviceId),
      "%02X%02X%02X%02X%02X%02X",
      mac[0],
      mac[1],
      mac[2],
      mac[3],
      mac[4],
      mac[5]);
  snprintf(
      telemetryTopic,
      sizeof(telemetryTopic),
      "%s/%s/telemetry",
      MQTT_TOPIC_PREFIX,
      deviceId);

  dht.setup(DHT_PIN, DHT_TYPE);
  Serial.printf("Device ID: %s\n", deviceId);
  Serial.printf("Tópico: %s\n", telemetryTopic);

  setupWifi();
#if MQTT_USE_TLS
  mqttTransport.setInsecure();
  mqttTransport.setHandshakeTimeout(30);
#endif
  applyMqttServer();
  mqtt.setBufferSize(256);
  mqtt.setSocketTimeout(15);
  reconnectMqtt();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWifi();
  }

  if (!mqtt.connected()) {
    reconnectMqtt();
    delay(500);
    return;
  }
  mqtt.loop();

  static uint32_t lastPublish = 0;
  if (millis() - lastPublish < PUBLISH_INTERVAL_MS) {
    delay(50);
    return;
  }
  lastPublish = millis();

  TempAndHumidity sample = dht.getTempAndHumidity();
  if (dht.getStatus() != 0) {
    Serial.printf("DHT erro: %s\n", dht.getStatusString());
    return;
  }

  char payload[160];
  snprintf(
      payload,
      sizeof(payload),
      "{\"deviceId\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f,\"unit\":\"C\"}",
      deviceId,
      sample.temperature,
      sample.humidity);

  if (mqtt.publish(telemetryTopic, payload, false)) {
    Serial.printf("Publicado: %s\n", payload);
    digitalWrite(LED_PIN, LOW);
    delay(80);
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("Falha ao publicar.");
  }
}
