import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CorrelationIdService {
 private readonly latestState = signal<string | null>(null);
 readonly latestId = this.latestState.asReadonly();
 create(): string { const id = globalThis.crypto?.randomUUID?.() ?? 'uaf-' + Date.now() + '-' + Math.random().toString(36).slice(2); this.latestState.set(id); return id; }
 capture(id: string | null): void { if (id) this.latestState.set(id); }
}
