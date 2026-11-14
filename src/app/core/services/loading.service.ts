import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  readonly isLoading = signal(false);
  begin(): void { this.count++; this.isLoading.set(true); }
  end(): void { this.count = Math.max(0, this.count - 1); this.isLoading.set(this.count > 0); }
}