import { Component, input } from '@angular/core';
@Component({
  selector: 'app-status-badge', standalone: true,
  template: `<span class="badge rounded-pill" [class.text-bg-success]="active()" [class.text-bg-secondary]="!active()">{{ active() ? 'Active' : 'Inactive' }}</span>`
})
export class StatusBadge { readonly active = input(true); }
