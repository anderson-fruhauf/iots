#include <Arduino.h>
#include <DHTesp.h>
#include <cstdio>

#include "app_config.h"
#include "infra/mqtt.h"
#include "secrets.h"
#include "services/telemetry.h"

static DHTesp s_dht;
static const char* s_deviceId = nullptr;
static const char* s_telemetryTopic = nullptr;

void telemetryInit(const char* deviceId, const char* telemetryTopic) {
  s_deviceId = deviceId;
  s_telemetryTopic = telemetryTopic;
  s_dht.setup(DHT_PIN, DHT_TYPE);
}

void telemetryTask() {
  TelemetryData telemetryData = getSensorData();
  telemetryPublish(telemetryData);
}

TelemetryData getSensorData() {
  TelemetryData out{};
  constexpr int kAttempts = 3;
  for (int attempt = 0; attempt < kAttempts; ++attempt) {
    TempAndHumidity sample = s_dht.getTempAndHumidity();
    if (s_dht.getStatus() == 0) {
      out.temperature = sample.temperature;
      out.humidity = sample.humidity;
      out.ok = true;
      return out;
    }
    if (attempt + 1 < kAttempts) {
      delay(150);
    }
  }
  Serial.printf("DHT erro: %s\n", s_dht.getStatusString());
  return out;
}

void telemetryPublish(const TelemetryData& data) {
  if (!data.ok) {
    return;
  }

  char payload[160];
  snprintf(
      payload,
      sizeof(payload),
      "{\"deviceId\":\"%s\",\"temperature\":%.1f,\"humidity\":%.1f,\"unit\":\"C\"}",
      s_deviceId,
      data.temperature,
      data.humidity);

  mqttPublish(s_telemetryTopic, payload, false);
}
