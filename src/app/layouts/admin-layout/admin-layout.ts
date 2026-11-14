import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastContainer } from '../../shared/components/toast-container/toast-container';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';
@Component({
 selector:'app-admin-layout',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,ToastContainer,ConfirmationDialog],
 template:`<div class="admin-shell" [class.sidebar-open]="sidebarOpen()"><aside class="sidebar">
 <a class="brand" routerLink="/dashboard"><span class="brand__mark">U</span><span><strong>UAF</strong><small>Management System</small></span></a>
 <div class="sidebar-caption">WORKSPACE</div><nav class="sidebar-nav" aria-label="Main navigation">
 <a routerLink="/dashboard" routerLinkActive="nav-link--active"><span>⌂</span> Overview</a>
 <div class="sidebar-caption sidebar-caption--spaced">UNIVERSITY</div>
 @for(item of modules;track item){<span class="nav-link nav-link--muted"><span>{{item.icon}}</span>{{item.name}}<small>SOON</small></span>}
 </nav><div class="sidebar-footer"><div class="sidebar-help-icon">?</div><div><strong>Need assistance?</strong><small>Contact your system administrator.</small></div></div><div class="sidebar-version">UAF PORTAL <span>v1.0</span></div>
 </aside><div class="admin-main"><header class="topbar"><div class="topbar-left"><button class="icon-button menu-toggle" (click)="sidebarOpen.update(v=>!v)" aria-label="Toggle navigation">☰</button><div class="breadcrumbs"><span>Workspace</span><b>/</b><strong>{{pageTitle()}}</strong></div></div>
 <div class="topbar-actions"><label class="global-search"><span>⌕</span><input aria-label="Global search" placeholder="Search workspace..." [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)"><kbd>⌘ K</kbd></label>
 @if(searchTerm()){<div class="search-results"><strong>Quick navigation</strong><a routerLink="/dashboard" (click)="searchTerm.set('')">Overview</a><span>Module search will expand as university features are released.</span></div>}
 <div class="topbar-divider"></div><div class="notification-wrap"><button class="icon-button notification-button" aria-label="Notifications" (click)="notificationsOpen.update(v=>!v)">♧<i></i></button>@if(notificationsOpen()){<div class="notification-popover"><strong>Notifications</strong><p>You are all caught up.</p><small>New activity will appear here.</small></div>}</div>
 <div class="topbar-divider"></div><div class="user-menu"><div class="user-avatar">{{initials}}</div><div class="user-meta"><strong>{{auth.currentUser()?.fullName??'University User'}}</strong><small>{{auth.currentUser()?.roles?.[0]??'Portal account'}}</small></div><button class="icon-button user-menu-button" aria-label="Profile menu" (click)="profileOpen.update(v=>!v)">⌄</button>
 @if(profileOpen()){<div class="profile-popover"><strong>{{auth.currentUser()?.email}}</strong><button (click)="logout()">Sign out</button></div>}</div></div></header>
 <main class="page-content"><router-outlet/></main><footer class="app-footer"><span>© {{year}} University of Agriculture, Faisalabad</span><span>UAF Management System · Secure workspace</span></footer></div></div>
 <app-toast-container/><app-confirmation-dialog/>`
})
export class AdminLayout {
 readonly auth=inject(AuthService);readonly notices=inject(NotificationService);private confirm=inject(ConfirmationService);private router=inject(Router);
 readonly sidebarOpen=signal(false);readonly profileOpen=signal(false);readonly notificationsOpen=signal(false);readonly searchTerm=signal('');readonly pageTitle=signal('Overview');readonly year=new Date().getFullYear();
 readonly modules=[{name:'Admissions',icon:'↗'},{name:'Academics',icon:'▤'},{name:'Students',icon:'♙'},{name:'Finance',icon:'◈'},{name:'Employees',icon:'♧'},{name:'Examinations',icon:'▣'}];
 get initials():string{return(this.auth.currentUser()?.fullName??'UAF').split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();}
 constructor(){this.router.events.pipe(filter(e=>e instanceof NavigationEnd)).subscribe(()=>{this.pageTitle.set(this.router.url.includes('dashboard')?'Overview':'Workspace');this.profileOpen.set(false);this.notificationsOpen.set(false);this.sidebarOpen.set(false);});}
 async logout():Promise<void>{this.profileOpen.set(false);const ok=await this.confirm.confirm('You will need to sign in again to access the portal.',{title:'Sign out of your account?',confirmText:'Sign out',danger:true});if(!ok)return;this.auth.logout().subscribe(()=>{this.notices.show('You have been signed out.','success');void this.router.navigateByUrl('/auth/login');});}
}