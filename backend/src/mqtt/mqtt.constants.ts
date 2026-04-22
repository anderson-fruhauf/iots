export const IOTS_DEVICE_TOPIC_PREFIX = 'iots/device';

export const MQTT_PATTERN_DEVICE_STATE = `${IOTS_DEVICE_TOPIC_PREFIX}/+/state`;
export const MQTT_PATTERN_DEVICE_TELEMETRY = `${IOTS_DEVICE_TOPIC_PREFIX}/+/telemetry`;

export function deviceCommandTopic(deviceId: string): string {
  return `${IOTS_DEVICE_TOPIC_PREFIX}/${deviceId}/command`;
}

const topicPrefixParts = IOTS_DEVICE_TOPIC_PREFIX.split('/');

export function extractDeviceIdFromDeviceTopic(
  topic: string,
  suffix: 'state' | 'telemetry',
): string | null {
  const parts = topic.split('/');
  if (parts.length < topicPrefixParts.length + 2) {
    return null;
  }
  for (let i = 0; i < topicPrefixParts.length; i++) {
    if (parts[i] !== topicPrefixParts[i]) {
      return null;
    }
  }
  if (parts[topicPrefixParts.length + 1] !== suffix) {
    return null;
  }
  return parts[topicPrefixParts.length] ?? null;
}
