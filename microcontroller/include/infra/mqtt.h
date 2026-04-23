#pragma once

#include <Arduino.h>

/** Monta `{prefix}/{deviceId}/telemetry` em `out`. */
void mqttBuildTelemetryTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId);

void mqttBuildCommandTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId);

void mqttBuildStateTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId);

void mqttBuildSoilTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId);

void mqttBuildIrrigationTopic(
    char* out,
    size_t outLen,
    const char* topicPrefix,
    const char* deviceId);

/**
 * Callback ao receber payload em `{prefix}/{deviceId}/command`.
 * `payload` é terminado em '\\0' (uso interno; não retido entre chamadas).
 */
void mqttSetCommandHandler(void (*handler)(const char* payload));

void mqttPublishLampState(
    const char* stateTopic,
    const char* deviceId,
    bool lampOn);

/** TLS / buffer / timeout do cliente (chamar antes de apply/reconnect). */
void mqttInitTransport();

void mqttApplyServer();

void mqttReconnect(const char* deviceId);

bool mqttConnected();

void mqttLoop();

bool mqttPublish(const char* topic, const char* payload, bool retained = false);
