import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-error-page',standalone:true,imports:[RouterLink],template:`<main class="error-page"><div class="error-illustration">{{code()}}</div><span class="eyebrow">UAF MANAGEMENT PORTAL</span><h1>{{title()}}</h1><p>{{message()}}</p><a class="btn btn--primary" routerLink="/dashboard">Return to dashboard</a></main>`})
export class ErrorPage {
 readonly code=input('404');readonly title=input('Page not found');readonly message=input('The page you are looking for may have moved or no longer exists.');
}