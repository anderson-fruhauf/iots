#pragma once

#include <cstdint>

enum class RelayChannel : uint8_t {
  Ch1 = 0,
};

void setupRelay();

void setRelay(RelayChannel channel, bool on);
