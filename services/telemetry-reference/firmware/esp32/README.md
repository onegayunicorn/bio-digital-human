# ESP32/S3 Firmware Boundary

The C++ header defines the data structure that approved sensor adapters must populate. A board-specific implementation should provide `read_bme280()`, `read_approved_field_sensor()`, `validate_reading()`, `enqueue_envelope()`, and `flush_queue()` behind a watchdog-controlled task.

The firmware must not implement neural stimulation, direct cortical writing, plasma control, or other hazardous actuation. It may expose read-only telemetry and explicitly bounded diagnostic outputs after electrical and safety review.

Required firmware tests include sensor disconnect, out-of-range values, brownout recovery, sequence continuity, clock failure, queue overflow, and cryptographic provisioning.
