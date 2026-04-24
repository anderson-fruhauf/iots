#include <Arduino.h>
#include <cmath>

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

/**
 * sRGB: canal 0-255 do app -> percepcao/LED: curva aprox. x^gamma (PWM linear).
 * Mantem s_r/s_g/s_b logicos; so a saida do LED e corrigida.
 */
static uint8_t gamma8(uint8_t v) {
  if (LAMP_RGB_GAMMA <= 1.0f) {
    return v;
  }
  const float t = static_cast<float>(v) / 255.0f;
  const int o = static_cast<int>(0.5f + 255.0f * std::pow(t, LAMP_RGB_GAMMA));
  if (o <= 0) {
    return 0U;
  }
  if (o >= 255) {
    return 255U;
  }
  return static_cast<uint8_t>(o);
}

static uint8_t scaleGain(uint8_t v, float gain) {
  const int o = static_cast<int>(0.5f + static_cast<float>(v) * gain);
  if (o <= 0) {
    return 0U;
  }
  if (o >= 255) {
    return 255U;
  }
  return static_cast<uint8_t>(o);
}

static uint8_t dutyForPin(uint8_t v) {
#if LAMP_RGB_COMMON_ANODE
  return static_cast<uint8_t>(255U - v);
#else
  return v;
#endif
}

static void writePwm(uint8_t r, uint8_t g, uint8_t b) {
  const uint8_t rP = gamma8(scaleGain(r, LAMP_RGB_GAIN_R));
  const uint8_t image.pnggP = gamma8(scaleGain(g, LAMP_RGB_GAIN_G));
  const uint8_t bP = gamma8(scaleGain(b, LAMP_RGB_GAIN_B));
  ledcWrite(CH_R, dutyForPin(rP));
  ledcWrite(CH_G, dutyForPin(gP));
  ledcWrite(CH_B, dutyForPin(bP));
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
