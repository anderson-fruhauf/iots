#include <Arduino.h>
#include <WiFi.h>
#include <cstdio>

#include "device/device_id.h"

void deviceIdFromMac(char* deviceId, size_t deviceIdLen) {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  snprintf(
      deviceId,
      deviceIdLen,
      "%02X%02X%02X%02X%02X%02X",
      mac[0],
      mac[1],
      mac[2],
      mac[3],
      mac[4],
      mac[5]);
}
