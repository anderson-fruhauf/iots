#pragma once

#include <stddef.h>

/** Lê o MAC Wi‑Fi e preenche `deviceId` (12 hex, sem separadores). Chame após `wifiStaMode()`. */
void deviceIdFromMac(char* deviceId, size_t deviceIdLen);
