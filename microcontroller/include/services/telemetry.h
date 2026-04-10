#pragma once

#include <Arduino.h>

struct TelemetryData {
  float temperature;
  float humidity;
  bool ok;
};

void telemetryInit(const char* deviceId, const char* telemetryTopic);

/** Lê sensor e publica (para Ticker / activity_signal). */
void telemetryTask();

TelemetryData getSensorData();

void telemetryPublish(const TelemetryData& data);
