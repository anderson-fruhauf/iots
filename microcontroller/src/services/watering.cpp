#include <Arduino.h>

#include "app_config.h"
#include "infra/relay.h"
#include "infra/soil_moisture.h"
#include "services/irrigation_report.h"
#include "services/watering.h"

namespace {
volatile bool s_minuteCheckDue = false;
bool s_irrigationActive = false;
uint32_t s_lastStepMs = 0;
uint32_t s_irrigationStartedMs = 0;
}  // namespace

bool shouldWater() { return soilIsDry(readSoilMoisture()); }

void water() {
  setRelay(RelayChannel::Ch1, true);
  delay(1000);
  setRelay(RelayChannel::Ch1, false);
}

void irrigationInit() { s_minuteCheckDue = true; }

void irrigationOnMinuteTick() { s_minuteCheckDue = true; }

void irrigationService() {
  if (s_minuteCheckDue) {
    s_minuteCheckDue = false;
    if (!s_irrigationActive) {
      const int raw = readSoilMoisture();
      const int wet = soilWetnessPercentFromRaw(raw);
      if (wet < SOIL_IRRIGATE_ON_BELOW_PCT) {
        s_irrigationActive = true;
        s_lastStepMs = millis();
        s_irrigationStartedMs = s_lastStepMs;
        setRelay(RelayChannel::Ch1, true);
      }
    }
  }

  if (!s_irrigationActive) {
    return;
  }

  const uint32_t now = millis();
  if (now - s_lastStepMs < SOIL_IRRIGATION_STEP_MS) {
    return;
  }
  s_lastStepMs = now;

  const int raw = readSoilMoisture();
  const int wet = soilWetnessPercentFromRaw(raw);

  if (wet >= SOIL_IRRIGATE_OFF_ABOVE_PCT ||
      now - s_irrigationStartedMs >= SOIL_IRRIGATION_MAX_ON_MS) {
    const uint32_t durationMs = now - s_irrigationStartedMs;
    setRelay(RelayChannel::Ch1, false);
    s_irrigationActive = false;
    irrigationReportSessionEnd(durationMs);
  }
}
