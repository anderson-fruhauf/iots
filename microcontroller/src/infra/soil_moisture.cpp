#include <Arduino.h>

#include "app_config.h"
#include "infra/soil_moisture.h"

void setupSoilMoisture() {
  pinMode(SOIL_MOISTURE_POWER_PIN, OUTPUT);
  digitalWrite(SOIL_MOISTURE_POWER_PIN, LOW);
  pinMode(SOIL_MOISTURE_SENSOR_PIN, INPUT);
}

int readSoilMoisture() {
  digitalWrite(SOIL_MOISTURE_POWER_PIN, HIGH);
  delay(SOIL_POWER_SETTLE_MS);
  const int v = analogRead(SOIL_MOISTURE_SENSOR_PIN);
  digitalWrite(SOIL_MOISTURE_POWER_PIN, LOW);
  return v;
}

int soilWetnessPercentFromRaw(int raw) {
  if (raw < 0) {
    raw = 0;
  }
  if (raw > SOIL_ADC_MAX) {
    raw = SOIL_ADC_MAX;
  }
  return (SOIL_ADC_MAX - raw) * 100 / SOIL_ADC_MAX;
}

bool soilIsDry(int raw) { return raw >= SOIL_DRY_THRESHOLD_RAW; }
