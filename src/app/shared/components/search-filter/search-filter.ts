import {Component,input,output,signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import type {SelectOption} from '../../models/ui.models';
@Component({selector:'app-search-filter',standalone:true,imports:[FormsModule],template:`<div class="d-flex flex-wrap align-items-center gap-2"><div class="input-group" style="max-width:360px"><span class="input-group-text bg-white" aria-hidden="true">⌕</span><input class="form-control" type="search" [ngModel]="query()" (ngModelChange)="onQuery($event)" [placeholder]="placeholder()" [attr.aria-label]="placeholder()"></div>@for(filter of filters();track filter.key){<select class="form-select" style="width:auto;min-width:150px" [ngModel]="values()[filter.key]??''" (ngModelChange)="onFilter(filter.key,$event)" [attr.aria-label]="filter.label"><option value="">{{filter.label}}</option>@for(option of filter.options;track option.value){<option [value]="option.value" [disabled]="option.disabled">{{option.label}}</option>}</select>}<button type="button" class="btn btn-light border" (click)="clear()" [disabled]="!hasFilters()">Clear</button><ng-content/></div>`})
export class SearchFilter {
 readonly placeholder=input('Search records…');readonly filters=input<{key:string;label:string;options:SelectOption[]}[]>([]);
 readonly queryChange=output<string>();readonly filterChange=output<Record<string,string>>();
 readonly query=signal('');readonly values=signal<Record<string,string>>({});
 readonly hasFilters=()=>!!this.query()||Object.values(this.values()).some(Boolean);
 onQuery(value:string){this.query.set(value);this.queryChange.emit(value);}
 onFilter(key:string,value:string){const next={...this.values(),[key]:value};this.values.set(next);this.filterChange.emit(next);}
 clear(){this.query.set('');this.values.set({});this.queryChange.emit('');this.filterChange.emit({});}
}
