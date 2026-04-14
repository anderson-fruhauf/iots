#include "services/display_sensor.h"

#include "infra/screen.h"
#include "services/telemetry.h"

void displaySensorPoll() {
  TelemetryData d = getSensorData();
  screenSetSensor(d.temperature, d.humidity, d.ok);
}
