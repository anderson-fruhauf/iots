#include <ArduinoJson.h>
#include <cstring>

#include "infra/lamp.h"
#include "infra/mqtt.h"
#include "infra/rgb_lamp.h"
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

static int byteFromJson(JsonVariant v, int defVal) {
  if (v.isNull()) {
    return defVal;
  }
  if (v.is<int>() || v.is<long>()) {
    return v.as<int>();
  }
  if (v.is<double>() || v.is<float>()) {
    return static_cast<int>(v.as<double>() + 0.5);
  }
  return defVal;
}

static void publishState() {
  if (!s_initialized) {
    return;
  }
  uint8_t r = 0;
  uint8_t g = 0;
  uint8_t b = 0;
  rgbLampGetColor(&r, &g, &b);
  mqttPublishDeviceState(
      s_stateTopic,
      s_deviceId,
      lampIsOn(),
      rgbLampIsOn(),
      r,
      g,
      b);
}

void lampCommandOnMqttPayload(const char* payload) {
  if (!s_initialized || payload == nullptr) {
    return;
  }
  // ArduinoJson 7: JsonDocument() cresce dinamicamente; nao ha constructor JsonDocument(512)
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.printf("lamp command: JSON erro %s, payload=%s\n", err.c_str(), payload);
    return;
  }
  if (doc.overflowed()) {
    Serial.println("lamp command: JsonDocument overflow (mem insuficiente).");
  }
  bool any = false;
  if (!doc["lamp"].isNull()) {
    bool on = false;
    if (lampValueFromJson(doc["lamp"], &on)) {
      lampSet(on);
      any = true;
    }
  }
  // Nao use doc["lampRgb"].is<JsonObject>() (MemberProxy no ArduinoJson 7 pode falhar com objetos)
  if (!doc["lampRgb"].isNull()) {
    JsonObject o = doc["lampRgb"].as<JsonObject>();
    const bool on = o["on"] | false;
    int r = byteFromJson(o["r"], 0);
    int g = byteFromJson(o["g"], 0);
    int b = byteFromJson(o["b"], 0);
    r = constrain(r, 0, 255);
    g = constrain(g, 0, 255);
    b = constrain(b, 0, 255);
    rgbLampSet(on, static_cast<uint8_t>(r), static_cast<uint8_t>(g), static_cast<uint8_t>(b));
    Serial.printf("lampRgb aplicado: on=%d r=%d g=%d b=%d\n", (int)on, r, g, b);
    any = true;
  }
  if (!any) {
    Serial.printf("lamp command: nada aplicado, payload=%s\n", payload);
    return;
  }
  publishState();
}

void lampCommandPublishCurrentState() { publishState(); }
