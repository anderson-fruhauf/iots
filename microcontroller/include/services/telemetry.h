#pragma once

#include <Arduino.h>

struct TelemetryData {
  float temperature;
  float humidity;
  bool ok;
};

void telemetryInit(const char* deviceId, const char* telemetryTopic);

TelemetryData getSensorData();

void telemetryPublish(const TelemetryData& data);
