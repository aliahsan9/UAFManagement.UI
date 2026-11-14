import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector:'app-auth-layout', standalone:true, imports:[RouterOutlet],
  template:`<main class="auth-shell">
    <section class="auth-brand-panel">
      <a class="brand brand--light" routerLink="/auth/login"><span class="brand__mark">U</span><span><strong>UAF</strong><small>Management System</small></span></a>
      <div class="auth-brand-copy"><span class="eyebrow eyebrow--light">UNIVERSITY OPERATIONS</span>
        <h1>One connected campus.<br><em>Infinite possibilities.</em></h1>
        <p>A secure, unified workspace for academic and administrative excellence.</p>
        <div class="auth-feature-list"><span>Academic administration</span><span>Student lifecycle management</span><span>Connected campus services</span></div>
      </div>
      <div class="auth-brand-footer">University of Agriculture, Faisalabad · Digital Campus</div>
    </section><section class="auth-form-panel"><router-outlet /></section>
  </main>`
})
export class AuthLayout {}