import { Component, inject } from '@angular/core';
import { ConfirmationService } from '../../../core/services/confirmation.service';
@Component({
  selector:'app-confirmation-dialog', standalone:true,
  template:`@if (confirmation.state(); as state) {
    <div class="modal-backdrop" (click)="confirmation.close(false)">
      <section class="confirm-dialog" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="confirm-dialog__icon">?</div><h2>{{ state.title }}</h2><p>{{ state.message }}</p>
        <div class="confirm-dialog__actions">
          <button class="btn btn--quiet" (click)="confirmation.close(false)">{{ state.cancelText }}</button>
          <button class="btn" [class.btn--danger]="state.danger" (click)="confirmation.close(true)">{{ state.confirmText }}</button>
        </div>
      </section>
    </div>
  }`
})
export class ConfirmationDialog { readonly confirmation = inject(ConfirmationService); }