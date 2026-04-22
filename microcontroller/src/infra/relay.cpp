#include <Arduino.h>

#include "app_config.h"
#include "infra/relay.h"

static int pinForChannel(RelayChannel ch) {
  switch (ch) {
    case RelayChannel::Ch1:
      return RELAY_PIN;
    default:
      return -1;
  }
}

void setupRelay() {
  const int pin = pinForChannel(RelayChannel::Ch1);
  if (pin < 0) {
    return;
  }
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
}

void setRelay(RelayChannel channel, bool on) {
  const int pin = pinForChannel(channel);
  if (pin < 0) {
    return;
  }
  digitalWrite(pin, on ? HIGH : LOW);
}
