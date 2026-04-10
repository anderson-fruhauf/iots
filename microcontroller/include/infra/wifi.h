#pragma once

/** Coloca o rádio em modo station (necessário antes de ler MAC / associar). */
void wifiStaMode();

/** Conecta em modo station (bloqueante até timeout). */
void wifiSetup();
