import {Component,computed,input,output,signal} from '@angular/core';
import {StatusBadge} from '../status-badge/status-badge';
import {LoadingSpinner} from '../loading-spinner/loading-spinner';
import {EmptyState} from '../empty-state/empty-state';
import {Pagination} from '../pagination/pagination';
import {SearchFilter} from '../search-filter/search-filter';
import {ErrorState} from '../error-state/error-state';
import type {DataTableColumn} from '../../models/ui.models';
type SortDirection='asc'|'desc';
@Component({selector:'app-data-table',standalone:true,imports:[StatusBadge,LoadingSpinner,EmptyState,Pagination,SearchFilter,ErrorState],template:`
@if(loading()){<app-loading-spinner label="Loading records…"/>}
@else if(error()){<app-error-state [message]="error()" [showRetry]="showRetry()" (retry)="retry.emit()"/>}
@else{<app-search-filter placeholder="Search records…" (queryChange)="onQuery($event)"/><div class="table-responsive mt-3"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr>@for(col of columns();track col.key){<th scope="col" [class.text-end]="col.align==='end'" [class.text-center]="col.align==='center'"><button type="button" class="btn btn-link p-0 text-decoration-none text-reset fw-semibold" [disabled]="col.sortable===false" (click)="sort(col)">{{col.label}} @if(sortKey()===String(col.key)){<span aria-hidden="true">{{sortDirection()==='asc'?'↑':'↓'}}</span>}</button></th>}@if(showStatus()){<th scope="col">Status</th>}@if(actionsEnabled()){<th scope="col" class="text-end">Actions</th>}</tr></thead><tbody>@for(row of pageRows();track trackBy(row)){<tr>@for(col of columns();track col.key){<td [class.text-end]="col.align==='end'" [class.text-center]="col.align==='center'">{{cellValue(row,col)}}</td>}@if(showStatus()){<td><app-status-badge [status]="statusValue(row)"/></td>}@if(actionsEnabled()){<td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" type="button" (click)="edit.emit(row)">Edit</button>@if(allowDeactivate()&&row['isActive']!==false){<button class="btn btn-sm btn-outline-danger" type="button" (click)="deactivate.emit(row)">Deactivate</button>}</td>}</tr>}@empty{<tr><td [attr.colspan]="columns().length+(showStatus()?1:0)+(actionsEnabled()?1:0)" class="p-0"><app-empty-state [title]="emptyTitle()" [description]="emptyMessage()"/></td></tr>}</tbody></table></div><div class="mt-3"><app-pagination [page]="page()" [pageSize]="pageSize()" [totalItems]="totalItems()??filteredRows().length" (pageChange)="onPageChange($event)"/></div>}
`})
export class DataTable {
 readonly columns=input.required<DataTableColumn[]>();readonly rows=input.required<Record<string,unknown>[]>();readonly loading=input(false);readonly error=input('');readonly emptyTitle=input('No records found');readonly emptyMessage=input('Try changing your search or filters.');readonly pageSize=input(10);readonly showStatus=input(false);readonly allowDeactivate=input(false);readonly actionsEnabled=input(true);
 readonly edit=output<Record<string,unknown>>();readonly deactivate=output<Record<string,unknown>>();readonly sortChange=output<{key:string;direction:SortDirection}>();readonly pageChange=output<number>();readonly queryChange=output<string>();readonly retry=output<void>();readonly serverSide=input(false);readonly totalItems=input<number|null>(null);readonly showRetry=input(false);
 readonly sortKey=signal('');readonly sortDirection=signal<SortDirection>('asc');readonly page=signal(1);readonly query=signal('');readonly String=String;
 readonly filteredRows=computed(()=>{if(this.serverSide())return this.rows();const q=this.query().trim().toLowerCase();return this.rows().filter(row=>!q||Object.values(row).some(v=>String(v??'').toLowerCase().includes(q)));});
 readonly sortedRows=computed(()=>{const key=this.sortKey();if(this.serverSide()||!key)return this.filteredRows();const direction=this.sortDirection()==='asc'?1:-1;return [...this.filteredRows()].sort((a,b)=>{const av=a[key],bv=b[key];if(av==null)return -1;if(bv==null)return 1;const an=Number(av),bn=Number(bv);const cmp=Number.isFinite(an)&&Number.isFinite(bn)?an-bn:String(av).localeCompare(String(bv),undefined,{numeric:true,sensitivity:'base'});return cmp*direction;});});
 readonly pageRows=computed(()=>{if(this.serverSide())return this.sortedRows();const start=(this.page()-1)*this.pageSize();return this.sortedRows().slice(start,start+this.pageSize());});
 onQuery(value:string){this.query.set(value);this.page.set(1);this.queryChange.emit(value);}
 onPageChange(value:number){this.page.set(value);this.pageChange.emit(value);}
 sort(col:DataTableColumn){if(col.sortable===false)return;const key=String(col.key),direction=this.sortKey()===key&&this.sortDirection()==='asc'?'desc':'asc';this.sortKey.set(key);this.sortDirection.set(direction);this.page.set(1);this.sortChange.emit({key,direction});}
 cellValue(row:Record<string,unknown>,col:DataTableColumn):string{const v=col.value?col.value(row):row[String(col.key)];return v===null||v===undefined||v===''?'—':String(v);}
 statusValue(row:Record<string,unknown>):string{return String(row['status']??(row['isActive']===false?'Inactive':'Active'));}
 trackBy(row:Record<string,unknown>):string{return String(row['id']??JSON.stringify(row));}
}