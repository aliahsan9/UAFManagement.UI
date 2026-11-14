import { Component } from '@angular/core';
@Component({
 selector:'app-dashboard',standalone:true,
 template:`<section class="page-heading"><div><span class="eyebrow">OVERVIEW</span><h1>Good to see you</h1><p>Here is your university operations overview.</p></div><div class="date-chip">◷ {{today}}</div></section>
 <section class="welcome-banner"><div><span class="banner-kicker">UAF DIGITAL CAMPUS</span><h2>Your campus, connected.</h2><p>A unified workspace for managing academic and administrative operations.</p></div><div class="banner-emblem">UAF</div></section>
 <section class="section-heading"><div><h2>Workspace</h2><p>Quick access to your key university modules.</p></div><span class="status-pill"><i></i> System ready</span></section>
 <section class="workspace-grid">@for(item of modules;track item.title){<article class="workspace-card"><div class="workspace-card__top"><span class="module-icon" [class]="item.color">{{item.icon}}</span><span class="module-arrow">↗</span></div><h3>{{item.title}}</h3><p>{{item.description}}</p><span class="module-link">Feature rollout <b>→</b></span></article>}</section>
 <section class="dashboard-bottom"><article class="info-panel"><div class="panel-heading"><div><h3>Getting started</h3><p>Your workspace foundation is ready.</p></div><span class="panel-icon">✦</span></div>
 @for(item of readiness;track item.title){<div class="check-row"><span>✓</span><div><strong>{{item.title}}</strong><small>{{item.detail}}</small></div><b>Ready</b></div>}</article>
 <article class="info-panel system-panel"><span class="eyebrow">PLATFORM</span><h3>Built for a connected university</h3><p>Academic, student, finance and administrative workflows will come together in one secure platform.</p><div class="system-footer"><span class="status-pill"><i></i> Foundation active</span><span>Phase 1</span></div></article></section>`
})
export class Dashboard {
 readonly today=new Intl.DateTimeFormat('en-PK',{dateStyle:'full'}).format(new Date());
 readonly modules=[
 {title:'Admissions',description:'Applications, reviews and admission decisions.',icon:'↗',color:'module-icon--blue'},
 {title:'Academics',description:'Faculties, departments, programs and courses.',icon:'▤',color:'module-icon--violet'},
 {title:'Students',description:'Student records and academic lifecycle.',icon:'♙',color:'module-icon--green'},
 {title:'Finance',description:'Fees, challans and financial operations.',icon:'◈',color:'module-icon--amber'},
 {title:'Employees',description:'Employee records and university workforce.',icon:'♧',color:'module-icon--rose'},
 {title:'Examinations',description:'Assessments, results and transcripts.',icon:'▣',color:'module-icon--cyan'}];
 readonly readiness=[
 {title:'Authentication configured',detail:'Secure sign-in and session refresh'},
 {title:'Workspace navigation',detail:'Centralized access to university modules'},
 {title:'Role-aware access',detail:'Route-level permission enforcement'}];
}