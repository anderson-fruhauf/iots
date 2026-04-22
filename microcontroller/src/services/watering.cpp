#include <Arduino.h>

#include "infra/relay.h"
#include "infra/soil_moisture.h"

bool shouldWater() { return soilIsDry(readSoilMoisture()); }

void water() {
  setRelay(RelayChannel::Ch1, true);
  delay(1000);
  setRelay(RelayChannel::Ch1, false);
}