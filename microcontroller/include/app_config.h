#pragma once

#include <cstdint>

// Pinos
static constexpr int LED_PIN = 2;
/** Lâmpada / carga (ex.: relé) — GPIO 19. */
static constexpr int LAMP_PIN = 19;
static constexpr int DHT_PIN = 23;

// sensor de umidade do solo (ADC: seco ~ alto, húmido ~ baixo)
static constexpr int SOIL_MOISTURE_SENSOR_PIN = 33;
static constexpr int SOIL_ADC_MAX = 4095;
static constexpr int SOIL_DRY_THRESHOLD_RAW =
    2000;  // >= este valor: considera seco (regue); calibra

// relay
static constexpr int RELAY_PIN = 4;

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
 * Intervalo entre envios (segundos) — telemetria e solo (mesmo Ticker em main).
 */
static constexpr float TELEMETRY_INTERVAL_S = 3600;

/** Período para `Ticker::attach(segundos, ...)` — redes + sensor e um único redesenho OLED. */
static constexpr float SCREEN_REFRESH_INTERVAL_S = 10.0f;