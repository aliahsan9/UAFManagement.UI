import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
@Component({
  selector:'app-toast-container', standalone:true,
  template:`<section class="toast-stack" aria-live="polite">@for (item of notices.items(); track item.id) {
    <article class="toast" [class]="'toast toast--' + item.type" role="status">
      <span class="toast__mark">{{ item.type === 'success' ? '✓' : item.type === 'error' ? '!' : 'i' }}</span>
      <div class="toast__body"><strong>{{ item.title }}</strong><p>{{ item.message }}</p></div>
      <button class="icon-button" aria-label="Dismiss" (click)="notices.dismiss(item.id)">×</button>
    </article>
  }</section>`
})
export class ToastContainer { readonly notices = inject(NotificationService); }