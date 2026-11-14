import {Component,input} from '@angular/core';
@Component({selector:'app-loading-spinner',standalone:true,template:`<div class="d-flex align-items-center justify-content-center gap-2 py-4 text-secondary" [attr.aria-busy]="true" role="status"><span class="spinner-border" [class.spinner-border-sm]="size()==='sm'" [class.spinner-border-lg]="size()==='lg'" aria-hidden="true"></span><span class="small">{{label()}}</span></div>`})
export class LoadingSpinner {readonly label=input('Loading…');readonly size=input<'sm'|'md'|'lg'>('md');}
