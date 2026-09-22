#pragma once
// Reference contract only. Replace stubs with reviewed drivers and board-specific
// isolation before connecting physical sensors. No neural stimulation or high-voltage
// control is implemented here.
#include <stdint.h>

namespace telemetry {
struct Reading {
  const char* channel_id;
  double value;
  const char* unit;
  uint8_t precision;
  double uncertainty;
  double quality;
};
struct Envelope {
  const char* schema_version;
  const char* message_id;
  const char* device_id;
  const char* firmware_version;
  uint64_t sequence;
  const char* captured_at;
  const char* status; // LIVE, CALIBRATED, SIMULATED, PROTOTYPE
  const Reading* readings;
  uint8_t reading_count;
};
}
