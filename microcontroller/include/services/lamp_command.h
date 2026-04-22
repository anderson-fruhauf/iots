#pragma once

#include <Arduino.h>

void lampCommandInit(const char* deviceId, const char* stateTopic);

void lampCommandOnMqttPayload(const char* payload);

void lampCommandPublishCurrentState();
