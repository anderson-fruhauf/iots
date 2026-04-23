#include <Arduino.h>
#include <ArduinoJson.h>

#include "infra/mqtt.h"
#include "services/irrigation_report.h"

namespace {
const char* s_deviceId = nullptr;
const char* s_irrigationTopic = nullptr;
}  // namespace

void irrigationReportInit(const char* deviceId, const char* irrigationTopic) {
  s_deviceId = deviceId;
  s_irrigationTopic = irrigationTopic;
}

void irrigationReportSessionEnd(uint32_t durationMs) {
  if (s_deviceId == nullptr || s_irrigationTopic == nullptr || !mqttConnected()) {
    return;
  }
  if (durationMs == 0U) {
    return;
  }
  JsonDocument doc;
  doc["deviceId"] = s_deviceId;
  doc["durationMs"] = durationMs;
  if (doc.overflowed()) {
    return;
  }
  char payload[128];
  const size_t n = serializeJson(doc, payload, sizeof(payload));
  if (n >= sizeof(payload)) {
    return;
  }
  mqttPublish(s_irrigationTopic, payload, false);
}
