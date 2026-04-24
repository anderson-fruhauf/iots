#pragma once

#include <cstdint>

// Pinos
static constexpr int LED_PIN = 2;
/** Lâmpada / carga (ex.: relé) — GPIO 19. */
static constexpr int LAMP_PIN = 19;
/**
 * LED RGB (PWM). Se só o vermelho acender: 34/35 nao suportam saida (so ADC) — G e B têm de ir a GPIOs
 * de saida. R=32; G e B: se verde/azul trocados no fio, inverta LAMP_RGB_PIN_G/B. Atual: G=26, B=25.
 * Anodo comum: LAMP_RGB_COMMON_ANODE = true.
 */
static constexpr int LAMP_RGB_PIN_R = 32;
static constexpr int LAMP_RGB_PIN_G = 26;
static constexpr int LAMP_RGB_PIN_B = 25;
static constexpr bool LAMP_RGB_COMMON_ANODE = false;
/** Correcao gama no PWM (sRGB ~2.2). Ajuste 1.8–2.6 se a cor ainda nao coincidir com o app. 1.0 = sem correcao. */
static constexpr float LAMP_RGB_GAMMA = 2.2f;
/**
 * Ganhos lineares por LED (0–~1.2). O vermelho costuma parecer mais forte: amarelo fica “laranjado”.
 */
static constexpr float LAMP_RGB_GAIN_R = 0.70f;
static constexpr float LAMP_RGB_GAIN_G = 1.0f;
static constexpr float LAMP_RGB_GAIN_B = 1.13f;
static constexpr int DHT_PIN = 23;

// sensor de umidade do solo (ADC: seco ~ alto, húmido ~ baixo)
static constexpr int SOIL_MOISTURE_POWER_PIN = 15;
static constexpr int SOIL_MOISTURE_SENSOR_PIN = 33;
static constexpr uint32_t SOIL_POWER_SETTLE_MS = 50;
static constexpr int SOIL_ADC_MAX = 4095;
static constexpr int SOIL_DRY_THRESHOLD_RAW =
    2000;  // >= este valor: considera seco (regue); calibra

// irrigação local (histerese em % de humidade do solo, 0=seco 100=húmido)
static constexpr int SOIL_IRRIGATE_ON_BELOW_PCT = 70;
static constexpr int SOIL_IRRIGATE_OFF_ABOVE_PCT = 80;
static constexpr float SOIL_IRRIGATION_CHECK_INTERVAL_S = 30.0f;
/** Com irrigação ativa, reavalia o solo a cada 1 s até atingir o alvo. */
static constexpr uint32_t SOIL_IRRIGATION_STEP_MS = 1000U;
/** Corta o relé se a irrigação exceder 20s (falha de leitura / gotejamento muito lento). */
static constexpr uint32_t SOIL_IRRIGATION_MAX_ON_MS = 20U * 1000U;

// relay — muitos módulos acionam com IN em LOW (fotoacoplador)
static constexpr bool RELAY_ACTIVE_LOW = true;
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

/** Intervalo entre envios de temperatura e humidade ambiente (MQTT), em segundos. */
static constexpr float TELEMETRY_INTERVAL_S = 3600.0f;

/** Intervalo entre envios de umidade do solo (MQTT), em segundos. */
static constexpr float SOIL_REPORT_INTERVAL_S = 30.0f;

/** Período para `Ticker::attach(segundos, ...)` — redes + sensor e um único redesenho OLED. */
static constexpr float SCREEN_REFRESH_INTERVAL_S = 10.0f;