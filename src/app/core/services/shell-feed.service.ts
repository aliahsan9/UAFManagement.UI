import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InboxNotice {
  id: string;
  title: string;
  message: string;
  channel: number | string;
  status: number | string;
  createdAtUtc: string;
  readAtUtc: string | null;
}

export interface StudentHit {
  id: string;
  fullName: string;
  registrationNumber: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class ShellFeedService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  notices(pageSize = 6): Observable<InboxNotice[] | null> {
    const params = new HttpParams().set('page', '1').set('pageSize', String(pageSize));
    return this.http.get<InboxNotice[]>(`${this.api}/api/v1/notifications/`, { params }).pipe(catchError(() => of(null)));
  }

  markRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/api/v1/notifications/${id}/read`, {});
  }

  searchStudents(query: string): Observable<StudentHit[] | null> {
    const params = new HttpParams().set('q', query).set('page', '1').set('pageSize', '6');
    return this.http.get<StudentHit[]>(`${this.api}/api/v1/search/students`, { params }).pipe(catchError(() => of(null)));
  }
}
