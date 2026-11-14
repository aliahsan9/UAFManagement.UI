import { Injectable, signal } from '@angular/core';
export interface ConfirmationState { title: string; message: string; confirmText: string; cancelText: string; danger: boolean; }
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly state = signal<ConfirmationState | null>(null);
  private resolve?: (value: boolean) => void;
  confirm(message: string, options: Partial<ConfirmationState> = {}): Promise<boolean> {
    this.resolve?.(false);
    this.state.set({ title: options.title ?? 'Confirm action', message, confirmText: options.confirmText ?? 'Continue', cancelText: options.cancelText ?? 'Cancel', danger: options.danger ?? false });
    return new Promise(resolve => this.resolve = resolve);
  }
  close(value: boolean): void { this.state.set(null); this.resolve?.(value); this.resolve = undefined; }
}