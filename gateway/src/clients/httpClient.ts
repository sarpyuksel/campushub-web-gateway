import { config } from '../config';

export async function forwardRequest<T>(
  baseUrl: string,
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: T | { error: string; message: string } }> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });

    const data = (await response.json().catch(() => ({}))) as T;
    return { status: response.status, data };
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError';
    return {
      status: isTimeout ? 504 : 502,
      data: {
        error: isTimeout ? 'GATEWAY_TIMEOUT' : 'BAD_GATEWAY',
        message: isTimeout
          ? 'Hedef servisten zaman aşımı nedeniyle yanıt alınamadı.'
          : 'Hedef servise ulaşılamadı.',
      },
    };
  }
}
