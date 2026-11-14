export interface DataTableColumn<T extends Record<string, unknown> = Record<string, unknown>> { key: keyof T | string; label: string; sortable?: boolean; align?: 'start'|'center'|'end'; value?: (row:T)=>string|number|null; }
export interface SelectOption<T=string> { label:string; value:T; disabled?:boolean; }
export interface DateRange { startDate:string; endDate:string; }
export interface TimelineEntry { id:string|number; title:string; description?:string|null; actor?:string|null; timestamp:string|Date; status?:string|null; }
export interface ChartDatum { label:string; value:number; color?:string; }
