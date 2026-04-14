#pragma once

#include <cstdint>

// Pinos
static constexpr int LED_PIN = 2;
static constexpr int DHT_PIN = 23;

// OLED 0,96" 128x64 I2C (SSD1306)
static constexpr int OLED_SDA_PIN = 21;
static constexpr int OLED_SCL_PIN = 22;
/** Endereço I2C 7 bits (típico 0x3C). */
static constexpr uint8_t OLED_I2C_ADDR = 0x3C;
static constexpr int OLED_WIDTH = 128;
static constexpr int OLED_HEIGHT = 64;

// WiFi / MQTT
static constexpr uint32_t WIFI_CONNECT_MS = 20000;
static constexpr uint32_t MQTT_FAIL_LOG_INTERVAL_MS = 5000;

/**
 * Intervalo entre envios (segundos) — primeiro argumento de Ticker::attach(segundos, ...).
 * Ex.: 1800 = 30 min; 3600 = 1 h.
 */
static constexpr float TELEMETRY_INTERVAL_S = 3600;

/** Período para `Ticker::attach(segundos, ...)` — redes + sensor e um único redesenho OLED. */
static constexpr float SCREEN_REFRESH_INTERVAL_S = 10.0f;