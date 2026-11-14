import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ServerValidationService } from '../../../core/services/server-validation.service';
import { portalHomeFor } from '../../../core/authorization/portal-home';
@Component({
  selector:'app-login', standalone:true, imports:[ReactiveFormsModule,RouterLink],
  template:`<div class="auth-card"><div class="auth-mobile-brand"><span class="brand__mark">U</span><strong>UAF Management</strong></div>
    <span class="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p class="auth-subtitle">Enter your university credentials to continue.</p>
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label for="email">University email</label><div class="field-wrap"><span class="field-icon">✉</span><input id="email" type="email" formControlName="email" placeholder="name@uaf.edu.pk" autocomplete="username"></div>
      @if (form.controls.email.touched && form.controls.email.invalid) { <small class="field-error">{{form.controls.email.errors?.['server']?.[0]??'Enter a valid email address.'}}</small> }
      <div class="password-label"><label for="password">Password</label><button class="text-button" type="button" (click)="showPassword.update(v=>!v)">{{showPassword()?'Hide':'Show'}}</button></div>
      <div class="field-wrap"><span class="field-icon">⌑</span><input id="password" [type]="showPassword()?'text':'password'" formControlName="password" placeholder="Enter your password" autocomplete="current-password"></div>
      @if (form.controls.password.touched && form.controls.password.invalid) { <small class="field-error">{{form.controls.password.errors?.['server']?.[0]??'Password is required.'}}</small> }
      <div class="form-meta"><label class="checkbox-label"><input type="checkbox" formControlName="remember"><span>Keep me signed in</span></label><span class="muted-note">Secure access</span></div>
      @if (errorMessage()) { <div class="inline-error" role="alert">{{errorMessage()}}</div> }
      <button class="btn btn--primary btn--block sign-in-button" type="submit" [disabled]="form.invalid||loading()">@if(loading()){<span class="spinner"></span> Signing in...} @else {Sign in <span>→</span>}</button>
    </form><p class="auth-switch">New to the portal? <a routerLink="/auth/register">Create an account</a></p>
    <div class="auth-security">▣ Your connection is protected with secure authentication.</div>
  </div>`
})
export class Login {
  private fb=inject(FormBuilder); private auth=inject(AuthService); private router=inject(Router); private notices=inject(NotificationService); private serverValidation=inject(ServerValidationService);
  readonly loading=signal(false); readonly showPassword=signal(false); readonly errorMessage=signal('');
  readonly form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',Validators.required],remember:[true]});
  submit():void {
    this.serverValidation.clear(this.form);
    if(this.form.invalid||this.loading()){this.form.markAllAsTouched();return;}
    this.loading.set(true);this.errorMessage.set('');
    const {email,password}=this.form.getRawValue();
    this.auth.login({email,password}).pipe(finalize(()=>this.loading.set(false))).subscribe({
      next:user=>{this.notices.show('You are signed in successfully.','success');void this.router.navigateByUrl(portalHomeFor(user));},
      error:e=>{if(e.status===400){const result=this.serverValidation.apply(this.form,e);this.errorMessage.set(result.summary[0]??'Review the highlighted fields.');}else this.errorMessage.set(e.status===401?'The email or password you entered is incorrect.':e.error?.detail??'Unable to sign in right now. Please try again.');}
    });
  }
}