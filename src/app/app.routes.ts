import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
export const routes: Routes = [
 {path:'auth',loadComponent:()=>import('./features/auth/auth-layout/auth-layout').then(m=>m.AuthLayout),children:[
  {path:'login',loadComponent:()=>import('./features/auth/login/login').then(m=>m.Login)},
  {path:'register',loadComponent:()=>import('./features/auth/register/register').then(m=>m.Register)},
  {path:'',pathMatch:'full',redirectTo:'login'}]},
 {path:'',canActivate:[authGuard],canActivateChild:[roleGuard],loadComponent:()=>import('./layouts/admin-layout/admin-layout').then(m=>m.AdminLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/dashboard/dashboard').then(m=>m.Dashboard)},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},
 {path:'forbidden',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),data:{code:'403',title:'Access restricted',message:'You do not have permission to view this page.'}},
 {path:'not-found',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage)},
 {path:'**',redirectTo:'not-found'}
];