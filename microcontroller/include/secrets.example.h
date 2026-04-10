#pragma once

// Copie este arquivo para secrets.h e preencha (secrets.h não vai para o git).

#define WIFI_SSID "sua-rede-wifi"
#define WIFI_PASS "sua-senha"

// Hostname do broker (sem https://). O URL https://... no painel é só a UI web.
// MQTT_USE_TLS 0 + porta 1883 = MQTT TCP (PubSubClient). 8883 = MQTTS (só se o painel expuser).
//
// Se o serial mostrar errno 104 / "Connection reset" na 1883 e 8883: o TCP não chega ao
// Mosquitto. No EasyPanel: publique a porta TCP do container (ex. 1883:1883), verifique
// firewall, e teste de outra rede: mosquitto_sub -h <host> -p 1883 -t test -v
// (se falhar no PC, o ESP também não conectará). PubSubClient não usa MQTT WebSocket.
#define MQTT_HOST "iot-mqtt.mxl9lo.easypanel.host"
#define MQTT_PORT 1883
#define MQTT_USE_TLS 0

// Tópico base; o firmware acrescenta o ID do chip (ex.: iots/device/A1B2C3D4E5F6/telemetry)
#define MQTT_TOPIC_PREFIX "iots/device"

// DHT11 ou DHT22 conforme o sensor físico
#define DHT_TYPE DHTesp::DHT22
