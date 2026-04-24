#include <Arduino.h>
#include "esp32-hal-ledc.h"

#include "app_config.h"
#include "infra/rgb_lamp.h"

static constexpr int LEDC_FREQ = 5000;
static constexpr uint8_t LEDC_BITS = 8;
static constexpr uint8_t CH_R = 0;
static constexpr uint8_t CH_G = 1;
static constexpr uint8_t CH_B = 2;

static bool s_on = false;
static uint8_t s_r = 255;
static uint8_t s_g = 255;
static uint8_t s_b = 255;

static uint8_t dutyForPin(uint8_t v) {
#if LAMP_RGB_COMMON_ANODE
  return static_cast<uint8_t>(255U - v);
#else
  return v;
#endif
}

static void writePwm(uint8_t r, uint8_t g, uint8_t b) {
  ledcWrite(CH_R, dutyForPin(r));
  ledcWrite(CH_G, dutyForPin(g));
  ledcWrite(CH_B, dutyForPin(b));
}

void rgbLampInit() {
  ledcSetup(CH_R, LEDC_FREQ, LEDC_BITS);
  ledcSetup(CH_G, LEDC_FREQ, LEDC_BITS);
  ledcSetup(CH_B, LEDC_FREQ, LEDC_BITS);
  ledcAttachPin(LAMP_RGB_PIN_R, CH_R);
  ledcAttachPin(LAMP_RGB_PIN_G, CH_G);
  ledcAttachPin(LAMP_RGB_PIN_B, CH_B);
  Serial.printf(
      "LED RGB: R=32 G=%d B=%d (verde/azul trocados? inverta G e B no app_config.h)\n",
      (int)LAMP_RGB_PIN_G,
      (int)LAMP_RGB_PIN_B);
  s_on = false;
  s_r = 255;
  s_g = 255;
  s_b = 255;
  writePwm(0, 0, 0);
}

void rgbLampSet(bool on, uint8_t r, uint8_t g, uint8_t b) {
  s_on = on;
  s_r = r;
  s_g = g;
  s_b = b;
  if (!on) {
    writePwm(0, 0, 0);
    return;
  }
  writePwm(r, g, b);
}

bool rgbLampIsOn() { return s_on; }

void rgbLampGetColor(uint8_t* r, uint8_t* g, uint8_t* b) {
  if (r) *r = s_r;
  if (g) *g = s_g;
  if (b) *b = s_b;
}
