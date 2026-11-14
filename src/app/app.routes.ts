import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
const academicPermissions = ['academic-structure.manage'];
const catalogPermissions = ['academic-catalog.manage'];
export const routes: Routes = [
 {path:'auth',loadComponent:()=>import('./features/auth/auth-layout/auth-layout').then(m=>m.AuthLayout),children:[
  {path:'login',loadComponent:()=>import('./features/auth/login/login').then(m=>m.Login)},
  {path:'register',loadComponent:()=>import('./features/auth/register/register').then(m=>m.Register)},
  {path:'',pathMatch:'full',redirectTo:'login'}]},
 {path:'',canActivate:[authGuard],canActivateChild:[roleGuard],loadComponent:()=>import('./layouts/admin-layout/admin-layout').then(m=>m.AdminLayout),children:[
  {path:'dashboard',loadComponent:()=>import('./features/dashboard/dashboard').then(m=>m.Dashboard)},
  {path:'academic-structure/universities',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'universities',permissions:academicPermissions}},
  {path:'academic-structure/campuses',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'campuses',permissions:academicPermissions}},
  {path:'academic-structure/faculties',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'faculties',permissions:academicPermissions}},
  {path:'academic-structure/departments',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'departments',permissions:academicPermissions}},
  {path:'academic-structure/programs',loadComponent:()=>import('./features/academic-structure/academic-structure-page').then(m=>m.AcademicStructurePage),data:{entity:'programs',permissions:academicPermissions}},
  {path:'academic-sessions',loadComponent:()=>import('./features/academic-catalog/academic-sessions-page').then(m=>m.AcademicSessionsPage),data:{permissions:catalogPermissions}},
  {path:'courses',loadComponent:()=>import('./features/academic-catalog/courses-page').then(m=>m.CoursesPage),data:{permissions:catalogPermissions}},
  {path:'',pathMatch:'full',redirectTo:'dashboard'}]},
 {path:'forbidden',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage),data:{code:'403',title:'Access restricted',message:'You do not have permission to view this page.'}},
 {path:'not-found',loadComponent:()=>import('./features/errors/error-page').then(m=>m.ErrorPage)},
 {path:'**',redirectTo:'not-found'}
];
