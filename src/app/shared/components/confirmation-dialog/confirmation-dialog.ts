import { Component, HostListener, inject } from '@angular/core';
import { ConfirmationService } from '../../../core/services/confirmation.service';
@Component({
  selector:'app-confirmation-dialog', standalone:true,
  template:`@if (confirmation.state(); as state) {
    <div class="modal-backdrop" (click)="confirmation.close(false)">
      <section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" (click)="$event.stopPropagation()">
        <div class="confirm-dialog__icon">?</div><h2 id="confirm-dialog-title">{{ state.title }}</h2><p id="confirm-dialog-message">{{ state.message }}</p>
        <div class="confirm-dialog__actions">
          <button class="btn btn--quiet" (click)="confirmation.close(false)">{{ state.cancelText }}</button>
          <button class="btn" [class.btn--danger]="state.danger" (click)="confirmation.close(true)">{{ state.confirmText }}</button>
        </div>
      </section>
    </div>
  }`
})
export class ConfirmationDialog { readonly confirmation = inject(ConfirmationService); @HostListener('document:keydown.escape') onEscape():void{if(this.confirmation.state())this.confirmation.close(false);} }
export { ConfirmationDialog as ConfirmDialogComponent };