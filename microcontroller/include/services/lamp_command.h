#pragma once

#include <Arduino.h>

/** Copia deviceId e tópico de estado (chamar antes de `mqttSetCommandHandler` / reconectar). */
void lampCommandInit(const char* deviceId, const char* stateTopic);

/** Handler para `mqttSetCommandHandler` — interpreta JSON `{"lamp":true|false}`. */
void lampCommandOnMqttPayload(const char* payload);

/** Publica estado retido atual da lâmpada (ex.: após conectar no broker). */
void lampCommandPublishCurrentState();
