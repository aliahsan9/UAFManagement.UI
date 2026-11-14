import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblemDetails } from '../models/api.models';
export interface AppliedValidationErrors { fields: Readonly<Record<string, readonly string[]>>; summary: readonly string[]; }
@Injectable({ providedIn: 'root' })
export class ServerValidationService {
 apply(form: FormGroup, error: unknown): AppliedValidationErrors {
  const body = error instanceof HttpErrorResponse ? error.error : error;
  const problem = body && typeof body === 'object' ? body as ApiProblemDetails : null;
  const fields: Record<string, readonly string[]> = {}; const summary: string[] = [];
  for (const [property, raw] of Object.entries(problem?.errors ?? {})) {
   const messages = (Array.isArray(raw) ? raw : [raw]).filter((x): x is string => typeof x === 'string' && !!x.trim()); if (!messages.length) continue;
   const key = Object.keys(form.controls).find(x => x.toLowerCase() === property.split('.').pop()?.replace(/\\[\\d+\\]/g, '').toLowerCase());
   const control = key ? form.controls[key] : null;
   if (control) { control.setErrors({ ...(control.errors ?? {}), server: messages }); control.markAsTouched(); fields[property] = messages; } else summary.push(...messages);
  }
  if (!Object.keys(problem?.errors ?? {}).length && problem?.detail) summary.push(problem.detail);
  if (!summary.length && !Object.keys(fields).length) summary.push('The server could not process this request. Review the information and try again.');
  return { fields, summary };
 }
 clear(form: FormGroup): void {
  const clearControl = (control: AbstractControl): void => { if (control instanceof FormGroup) Object.values(control.controls).forEach(clearControl); if (control.errors?.['server']) { const { server: _server, ...remaining } = control.errors; control.setErrors(Object.keys(remaining).length ? remaining : null); } };
  clearControl(form);
 }
}
