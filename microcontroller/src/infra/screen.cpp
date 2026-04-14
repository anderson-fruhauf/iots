#include <Arduino.h>
#include <Wire.h>
#include <cstdio>

#include <U8g2lib.h>

#include "app_config.h"
#include "infra/screen.h"

static U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(
    U8G2_R0,
    U8X8_PIN_NONE,
    OLED_SCL_PIN,
    OLED_SDA_PIN);

static bool s_displayOk = false;

static bool s_wifiOk = false;
static bool s_mqttOk = false;
static float s_tempC = 0.f;
static float s_humPct = 0.f;
static bool s_sensorOk = false;

static constexpr int kMetricTop = 14;
static constexpr int kMetricH = 50;
static constexpr int kHalfW = 64;

/** “Cor” em OLED mono: bloco invertido (branco) vs moldura com texto branco. */
static void screenRedraw() {
  if (!s_displayOk) {
    return;
  }
  u8g2.clearBuffer();

  u8g2.setFont(u8g2_font_6x10_tf);
  u8g2.setDrawColor(1);
  char line[48];
  snprintf(
      line,
      sizeof(line),
      "WiFi %s | MQTT %s",
      s_wifiOk ? "OK" : "--",
      s_mqttOk ? "OK" : "--");
  u8g2.drawStr(0, 11, line);

  if (!s_sensorOk) {
    u8g2.setFont(u8g2_font_10x20_tf);
    u8g2.drawStr(18, 48, "--");
    u8g2.setFont(u8g2_font_6x10_tf);
    u8g2.drawStr(28, 62, "sensor");
    u8g2.sendBuffer();
    return;
  }

  char buf[16];

  u8g2.setDrawColor(1);
  u8g2.drawBox(0, kMetricTop, kHalfW, kMetricH);
  u8g2.setDrawColor(0);
  u8g2.setFont(u8g2_font_logisoso20_tf);
  snprintf(buf, sizeof(buf), "%.1f", s_tempC);
  {
    int tw = u8g2.getStrWidth(buf);
    int x = (kHalfW - tw) / 2;
    u8g2.drawStr(x, 44, buf);
  }
  u8g2.setFont(u8g2_font_6x10_tf);
  {
    int tw = u8g2.getUTF8Width("\xC2\xB0\x43");
    int x = (kHalfW - tw) / 2;
    u8g2.drawUTF8(x, 58, "\xC2\xB0\x43");
  }

  u8g2.setDrawColor(1);
  u8g2.drawFrame(kHalfW, kMetricTop, kHalfW, kMetricH);
  u8g2.setFont(u8g2_font_logisoso20_tf);
  snprintf(buf, sizeof(buf), "%.0f", s_humPct);
  {
    int tw = u8g2.getStrWidth(buf);
    int x = kHalfW + (kHalfW - tw) / 2;
    u8g2.drawStr(x, 44, buf);
  }
  u8g2.setFont(u8g2_font_6x10_tf);
  {
    const char* pct = "%";
    int tw = u8g2.getStrWidth(pct);
    int x = kHalfW + (kHalfW - tw) / 2;
    u8g2.drawStr(x, 58, pct);
  }

  u8g2.sendBuffer();
}

void screenInit() {
  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
  Wire.setClock(100000);
  delay(50);

  u8g2.setI2CAddress(static_cast<uint8_t>(OLED_I2C_ADDR << 1));
  if (!u8g2.begin()) {
    s_displayOk = false;
    return;
  }
  s_displayOk = true;
  u8g2.setContrast(255);
  u8g2.enableUTF8Print();
  screenRedraw();
}

void screenSetNetwork(bool wifiOk, bool mqttOk) {
  s_wifiOk = wifiOk;
  s_mqttOk = mqttOk;
}

void screenSetSensor(float tempC, float humPct, bool ok) {
  if (!ok) {
    return;
  }
  s_tempC = tempC;
  s_humPct = humPct;
  s_sensorOk = true;
}

void screenRefresh() { screenRedraw(); }
