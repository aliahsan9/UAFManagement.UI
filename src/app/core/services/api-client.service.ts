import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IDEMPOTENCY_KEY } from '../http/http-context.tokens';
import { ApiListQuery } from '../models/api.models';
export interface ApiRequestOptions { params?: Readonly<Record<string, string | number | boolean | null | undefined>>; idempotencyKey?: string; }
@Injectable({ providedIn: 'root' })
export class ApiClient {
 private readonly http = inject(HttpClient);
 private readonly baseUrl = environment.apiBaseUrl.replace(/\\/$/, '');
 get<T>(path: string, options: ApiRequestOptions = {}): Observable<T> { return this.http.get<T>(this.url(path), this.options(options)); }
 post<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> { return this.http.post<T>(this.url(path), body, this.options(options)); }
 put<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> { return this.http.put<T>(this.url(path), body, this.options(options)); }
 patch<T>(path: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> { return this.http.patch<T>(this.url(path), body, this.options(options)); }
 delete<T>(path: string, options: ApiRequestOptions = {}): Observable<T> { return this.http.delete<T>(this.url(path), this.options(options)); }
 getBlob(path: string, options: ApiRequestOptions = {}): Observable<Blob> { return this.http.get(this.url(path), { ...this.options(options), responseType: 'blob' }); }
 toQueryParams(query: ApiListQuery): HttpParams { let params = new HttpParams(); const { filters, ...values } = query; for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); for (const [key, value] of Object.entries(filters ?? {})) if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); return params; }
 private url(path: string): string { return this.baseUrl + '/' + path.replace(/^\\/+/, ''); }
 private options(options: ApiRequestOptions): { params: HttpParams; context: HttpContext } { let params = new HttpParams(); for (const [key, value] of Object.entries(options.params ?? {})) if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value)); let context = new HttpContext(); if (options.idempotencyKey) { if (!/^[\\x20-\\x7E]{1,128}$/.test(options.idempotencyKey)) throw new Error('Idempotency keys must contain 1-128 printable ASCII characters.'); context = context.set(IDEMPOTENCY_KEY, options.idempotencyKey); } return { params, context }; }
}
