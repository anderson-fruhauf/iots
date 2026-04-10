#include <Arduino.h>

#include "app_config.h"
#include "esp32-hal-gpio.h"
#include "infra/led.h"

static volatile uint8_t s_activityDepth = 0;

void ledInit() {
  pinMode(LED_PIN, OUTPUT);
}

void ledOn() {
  digitalWrite(LED_PIN, HIGH);
}

void ledOff() {
  digitalWrite(LED_PIN, LOW);
}