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
  setRelay(RelayChannel::Ch1, false);
}

void setRelay(RelayChannel channel, bool on) {
  const int pin = pinForChannel(channel);
  if (pin < 0) {
    return;
  }
  const bool levelHigh = RELAY_ACTIVE_LOW ? !on : on;
  digitalWrite(pin, levelHigh ? HIGH : LOW);
}
