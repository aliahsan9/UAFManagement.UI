import { Component, computed, input, output, signal } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';
import { TableColumn } from '../../../features/academic-structure/academic-structure.models';
@Component({
  selector: 'app-data-table', standalone: true, imports: [StatusBadge],
  template: `
  <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
    <div class="input-group input-group-sm" style="max-width:300px"><span class="input-group-text bg-white">Search</span><input class="form-control" type="search" placeholder="Filter records..." [value]="query()" (input)="query.set($any($event.target).value)"></div>
    <span class="small text-secondary">{{ filtered().length }} record(s)</span>
  </div>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light"><tr>@for(col of columns(); track col.key){<th scope="col">{{ col.label }}</th>}@if(showStatus()){<th scope="col">Status</th>}<th scope="col" class="text-end">Actions</th></tr></thead>
      <tbody>
      @for(row of filtered(); track row['id']) {
        <tr>@for(col of columns(); track col.key){<td>{{ display(row, col.key) }}</td>}
          @if(showStatus()){<td><app-status-badge [active]="row['isActive'] !== false"/></td>}
          <td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary me-1" type="button" (click)="edit.emit(row)">Edit</button>@if(allowDeactivate() && row['isActive'] !== false){<button class="btn btn-sm btn-outline-danger" type="button" (click)="deactivate.emit(row)">Deactivate</button>}</td>
        </tr>
      } @empty {<tr><td [attr.colspan]="columns().length + (showStatus() ? 1 : 0) + 1" class="text-center py-5 text-secondary">No matching records found.</td></tr>}
      </tbody>
    </table>
  </div>`
})
export class DataTable {
  readonly columns = input.required<TableColumn[]>();
  readonly showStatus = input(true);
  readonly allowDeactivate = input(true);
  readonly rows = input.required<Record<string, unknown>[]>();
  readonly edit = output<Record<string, unknown>>();
  readonly deactivate = output<Record<string, unknown>>();
  readonly query = signal('');
  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.rows().filter(row => !q || Object.values(row).some(value => String(value ?? '').toLowerCase().includes(q)));
  });
  display(row: Record<string, unknown>, key: string): string {
    const value = row[key];
    if (key === 'degreeLevel' && typeof value === 'number') return ({1:'Undergraduate',2:'Graduate',3:'MPhil',4:'Doctoral'} as Record<number,string>)[value] ?? String(value);
    return value == null || value === '' ? '—' : String(value);
  }
}
