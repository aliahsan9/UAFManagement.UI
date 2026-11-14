export interface ApiProblemDetails { type?: string; title?: string; status?: number; detail?: string; instance?: string; traceId?: string; errors?: Record<string, string[] | string>; }
export interface ApiListQuery { page?: number; pageSize?: number; search?: string; sortBy?: string; sortDirection?: 'asc' | 'desc'; filters?: Readonly<Record<string, string | number | boolean | null | undefined>>; }
export interface HealthCheckEntryDto { name: string; status: string; durationMs?: number; }
export interface HealthCheckReportDto { status: string; checks: HealthCheckEntryDto[]; }
