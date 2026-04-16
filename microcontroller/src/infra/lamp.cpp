#include "app_config.h"
#include "infra/lamp.h"

static bool s_on = false;

void lampInit() {
  pinMode(LAMP_PIN, OUTPUT);
  digitalWrite(LAMP_PIN, LOW);
  s_on = false;
}

void lampSet(bool on) {
  s_on = on;
  digitalWrite(LAMP_PIN, on ? HIGH : LOW);
}

bool lampIsOn() { return s_on; }
