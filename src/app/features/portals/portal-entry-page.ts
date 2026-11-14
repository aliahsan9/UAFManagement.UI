import { Component,inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { portalHomeFor } from '../../core/authorization/portal-home';
@Component({selector:'app-portal-entry-page',standalone:true,template:`<main class="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary"><div class="text-center"><span class="spinner-border text-primary" role="status" aria-label="Loading portal"></span><p class="text-secondary small mt-3 mb-0">Opening your workspace…</p></div></main>`})
export class PortalEntryPage {
 private readonly auth=inject(AuthService);private readonly router=inject(Router);
 constructor(){void this.router.navigateByUrl(portalHomeFor(this.auth.currentUser()));}
}
