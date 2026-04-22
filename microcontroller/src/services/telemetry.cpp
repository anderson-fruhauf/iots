#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHTesp.h>
#include <cmath>

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
  if (!data.ok || s_deviceId == nullptr || s_telemetryTopic == nullptr) {
    return;
  }

  JsonDocument doc;
  doc["deviceId"] = s_deviceId;
  doc["temperature"] = std::round(data.temperature * 10.0f) / 10.0f;
  doc["humidity"] = std::round(data.humidity * 10.0f) / 10.0f;
  doc["unit"] = "C";
  if (doc.overflowed()) {
    return;
  }
  char payload[192];
  const size_t n = serializeJson(doc, payload, sizeof(payload));
  if (n >= sizeof(payload)) {
    return;
  }
  mqttPublish(s_telemetryTopic, payload, false);
}
