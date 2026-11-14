import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
@Component({
 selector:'app-register',standalone:true,imports:[ReactiveFormsModule,RouterLink],
 template:`<div class="auth-card"><div class="auth-mobile-brand"><span class="brand__mark">U</span><strong>UAF Management</strong></div>
 <span class="eyebrow">GET STARTED</span><h2>Create your account</h2><p class="auth-subtitle">Register to access the university management portal.</p>
 <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
 <label for="fullName">Full name</label><div class="field-wrap"><span class="field-icon">♙</span><input id="fullName" formControlName="fullName" placeholder="Your full name" autocomplete="name"></div>
 @if(form.controls.fullName.touched&&form.controls.fullName.invalid){<small class="field-error">Please enter your full name.</small>}
 <label for="regEmail">Email address</label><div class="field-wrap"><span class="field-icon">✉</span><input id="regEmail" type="email" formControlName="email" placeholder="name@uaf.edu.pk" autocomplete="email"></div>
 @if(form.controls.email.touched&&form.controls.email.invalid){<small class="field-error">Enter a valid email address.</small>}
 <label for="regPassword">Password</label><div class="field-wrap"><span class="field-icon">⌑</span><input id="regPassword" type="password" formControlName="password" placeholder="At least 8 characters" autocomplete="new-password"></div>
 @if(form.controls.password.touched&&form.controls.password.invalid){<small class="field-error">Use at least 8 characters.</small>}
 @if(errorMessage()){<div class="inline-error" role="alert">{{errorMessage()}}</div>}
 <button class="btn btn--primary btn--block sign-in-button" type="submit" [disabled]="form.invalid||loading()">@if(loading()){<span class="spinner"></span> Creating account...} @else {Create account <span>→</span>}</button>
 </form><p class="auth-switch">Already registered? <a routerLink="/auth/login">Sign in</a></p>
 <div class="auth-security">▣ Account access is governed by university security policies.</div></div>`
})
export class Register {
 private fb=inject(FormBuilder);private auth=inject(AuthService);private router=inject(Router);private notices=inject(NotificationService);
 readonly loading=signal(false);readonly errorMessage=signal('');
 readonly form=this.fb.nonNullable.group({fullName:['',[Validators.required,Validators.maxLength(120)]],email:['',[Validators.required,Validators.email]],password:['',[Validators.required,Validators.minLength(8)]]});
 submit():void {
  if(this.form.invalid||this.loading()){this.form.markAllAsTouched();return;}
  this.loading.set(true);this.errorMessage.set('');
  this.auth.register(this.form.getRawValue()).pipe(finalize(()=>this.loading.set(false))).subscribe({
   next:()=>{this.notices.show('Your account has been created.','success');void this.router.navigateByUrl('/dashboard');},
   error:e=>this.errorMessage.set(e.error?.error??e.error?.detail??'Registration could not be completed. Please try again.')
  });
 }
}