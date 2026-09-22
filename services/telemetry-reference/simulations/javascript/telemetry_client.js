import crypto from 'node:crypto';

export function canonicalJson(value) { return JSON.stringify(value, Object.keys(value).sort()); }
export function signRequest({ method, path, timestamp, nonce, body, secret }) {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
  const message = `${method.toUpperCase()}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

export async function sendTelemetry({ baseUrl, envelope, deviceId, secret, fetchImpl = fetch, maxAttempts = 4 }) {
  const path = '/v1/telemetry';
  const body = JSON.stringify(envelope);
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const timestamp = String(Date.now() / 1000);
    const nonce = crypto.randomUUID();
    const headers = {'content-type':'application/json', 'x-device-id':deviceId, 'x-timestamp':timestamp,
      'x-nonce':nonce, 'x-signature':signRequest({method:'POST', path, timestamp, nonce, body, secret})};
    try {
      const response = await fetchImpl(`${baseUrl}${path}`, {method:'POST', headers, body});
      if ([401,403,409,422].includes(response.status)) throw new Error(`non-retryable telemetry error: ${response.status}`);
      if (response.status >= 500) throw new Error(`retryable server error: ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.min(8000, 250 * (2 ** attempt))));
    }
  }
  throw lastError;
}
