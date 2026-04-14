#include <Arduino.h>
#include <WiFi.h>
#include "infra/led.h"
#include "app_config.h"
#include "infra/wifi.h"
#include "secrets.h"

void wifiStaMode() { WiFi.mode(WIFI_STA); }

void wifiSetup() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_CONNECT_MS) {
    ledToggle();
    delay(250);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("WiFi OK, IP: %s\n", WiFi.localIP().toString().c_str());
    ledOff();
  } else {
    Serial.println("WiFi falhou (timeout).");
    ledOff();
  }
}
