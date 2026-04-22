#include <ArduinoJson.h>
#include <cstring>

#include "infra/lamp.h"
#include "infra/mqtt.h"
#include "services/lamp_command.h"

static char s_deviceId[20];
static char s_stateTopic[72];
static bool s_initialized = false;

void lampCommandInit(const char* deviceId, const char* stateTopic) {
  strncpy(s_deviceId, deviceId, sizeof(s_deviceId) - 1);
  s_deviceId[sizeof(s_deviceId) - 1] = '\0';
  strncpy(s_stateTopic, stateTopic, sizeof(s_stateTopic) - 1);
  s_stateTopic[sizeof(s_stateTopic) - 1] = '\0';
  s_initialized = true;
}

static bool lampValueFromJson(JsonVariant v, bool* out) {
  if (v.isNull()) {
    return false;
  }
  if (v.is<bool>()) {
    *out = v.as<bool>();
    return true;
  }
  if (v.is<long>() || v.is<int>()) {
    *out = v.as<long>() != 0;
    return true;
  }
  if (v.is<double>() || v.is<float>()) {
    *out = v.as<double>() != 0.0;
    return true;
  }
  return false;
}

void lampCommandOnMqttPayload(const char* payload) {
  if (!s_initialized || payload == nullptr) {
    return;
  }
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    return;
  }
  bool on = false;
  if (!lampValueFromJson(doc["lamp"], &on)) {
    return;
  }
  lampSet(on);
  mqttPublishLampState(s_stateTopic, s_deviceId, on);
}

void lampCommandPublishCurrentState() {
  if (!s_initialized) {
    return;
  }
  mqttPublishLampState(s_stateTopic, s_deviceId, lampIsOn());
}
