#include <Arduino.h>
#include <ArduinoJson.h>

#include "app_config.h"
#include "infra/mqtt.h"
#include "infra/soil_moisture.h"
#include "services/soil_report.h"

static const char* s_deviceId = nullptr;
static const char* s_soilTopic = nullptr;

void soilReportInit(const char* deviceId, const char* soilTopic) {
  s_deviceId = deviceId;
  s_soilTopic = soilTopic;
}

void soilReportTask() {
  if (s_deviceId == nullptr || s_soilTopic == nullptr) {
    return;
  }
  const int raw = readSoilMoisture();
  const int wet = soilWetnessPercentFromRaw(raw);

  JsonDocument doc;
  doc["deviceId"] = s_deviceId;
  doc["soilRaw"] = raw;
  doc["wetPercent"] = wet;
  if (doc.overflowed()) {
    return;
  }
  char payload[128];
  const size_t n = serializeJson(doc, payload, sizeof(payload));
  if (n >= sizeof(payload)) {
    return;
  }
  mqttPublish(s_soilTopic, payload, false);
}
