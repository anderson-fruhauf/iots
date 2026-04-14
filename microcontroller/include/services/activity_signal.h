#pragma once

#include "infra/led.h"

/**
 * Middleware: LED ligado durante o handler (template com ponteiro de função —
 * compatível com Ticker::attach, que não aceita std::function).
 *
 * Uso:
 *   timerTelemetry.attach(TELEMETRY_INTERVAL_S, activeSignal(telemetryTask));
 *   activeSignal(telemetryTask)();  // primeira execução
 */
template <void (*H)()>
void activityBridge() {
  ledOn();
  H();
  ledOff();
}

#define activeSignal(fn) activityBridge<fn>
