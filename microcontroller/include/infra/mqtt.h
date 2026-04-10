#pragma once

#include <Arduino.h>

/** Monta `{prefix}/{deviceId}/telemetry` em `out`. */
void mqttBuildTelemetryTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId);

/** TLS / buffer / timeout do cliente (chamar antes de apply/reconnect). */
void mqttInitTransport();

void mqttApplyServer();

void mqttReconnect(const char* deviceId);

bool mqttConnected();

void mqttLoop();

bool mqttPublish(const char* topic, const char* payload, bool retained = false);
