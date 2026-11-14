import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { ToastContainer } from './shared/components/toast-container/toast-container';
import { ConfirmationDialog } from './shared/components/confirmation-dialog/confirmation-dialog';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,ToastContainer,ConfirmationDialog],template:`@if(loading.isLoading()){<div class="global-progress" role="progressbar" aria-label="Loading"></div>}<router-outlet/><app-toast-container/><app-confirmation-dialog/>`})
export class App { readonly loading=inject(LoadingService);}