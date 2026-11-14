import { Injectable, signal } from '@angular/core';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface AppNotification { id: number; title: string; message: string; type: NotificationType; }
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private id = 0;
  readonly items = signal<AppNotification[]>([]);
  show(message: string, type: NotificationType = 'info', title?: string): void {
    const item = { id: ++this.id, title: title ?? ({success:'Success',error:'Request failed',warning:'Attention',info:'Information'}[type]), message, type };
    this.items.update(items => [...items, item]);
    window.setTimeout(() => this.dismiss(item.id), 5000);
  }
  dismiss(id: number): void { this.items.update(items => items.filter(x => x.id !== id)); }
}