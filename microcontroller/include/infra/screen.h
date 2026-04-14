#pragma once

/** OLED SSD1306 I2C (init + atualização por campos). */
void screenInit();

/** Atualiza só o estado em RAM; chame `screenRefresh()` depois para redesenhar uma vez. */
void screenSetNetwork(bool wifiOk, bool mqttOk);

/** Só aplica valores quando `ok`; leitura ruim não apaga o último valor válido na tela. */
void screenSetSensor(float tempC, float humPct, bool ok);

/** Envia o buffer ao display (após atualizar rede + sensor). */
void screenRefresh();
