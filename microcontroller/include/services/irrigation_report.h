#pragma once

#include <cstdint>

void irrigationReportInit(const char* deviceId, const char* irrigationTopic);

void irrigationReportSessionEnd(uint32_t durationMs);
