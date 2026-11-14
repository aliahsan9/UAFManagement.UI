import { HttpContextToken } from '@angular/common/http';
export const IDEMPOTENCY_KEY = new HttpContextToken<string | null>(() => null);
export function createIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? 'uaf-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}
