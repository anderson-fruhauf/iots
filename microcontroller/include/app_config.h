#pragma once

#include <cstdint>

// Pinos
static constexpr int LED_PIN = 2;
static constexpr int DHT_PIN = 23;

// WiFi / MQTT
static constexpr uint32_t WIFI_CONNECT_MS = 20000;
static constexpr uint32_t MQTT_FAIL_LOG_INTERVAL_MS = 5000;

/**
 * Intervalo entre envios (segundos) — primeiro argumento de Ticker::attach(segundos, ...).
 * Ex.: 1800 = 30 min; 3600 = 1 h.
 */
static constexpr float TELEMETRY_INTERVAL_S = 1800;
