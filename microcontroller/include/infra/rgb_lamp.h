#pragma once

#include <cstdint>

void rgbLampInit();

void rgbLampSet(bool on, uint8_t r, uint8_t g, uint8_t b);

bool rgbLampIsOn();

void rgbLampGetColor(uint8_t* r, uint8_t* g, uint8_t* b);
