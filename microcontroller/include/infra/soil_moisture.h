#pragma once

void setupSoilMoisture();
int readSoilMoisture();
int soilWetnessPercentFromRaw(int raw);
bool soilIsDry(int raw);