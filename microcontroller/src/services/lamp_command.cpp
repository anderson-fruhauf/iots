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

void lampCommandOnMqttPayload(const char* payload) {
  if (!s_initialized) {
    return;
  }
  if (strstr(payload, "\"lamp\"") == nullptr) {
    return;
  }
  bool on = false;
  if (strstr(payload, "\"lamp\":true") != nullptr ||
      strstr(payload, "\"lamp\": true") != nullptr) {
    on = true;
  } else if (
      strstr(payload, "\"lamp\":false") != nullptr ||
      strstr(payload, "\"lamp\": false") != nullptr) {
    on = false;
  } else {
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
