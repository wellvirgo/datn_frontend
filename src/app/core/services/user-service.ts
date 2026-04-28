import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { CustomerItemRes, DasUserDetailRes, DasUserItemRes, UserSummaryInfo } from '../dto/user';
import { ApiResponse, PageableResponse } from '../dto/api-response';
import { NotifyService } from '../common/notify-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static readonly API_URL = 'http://localhost:8080/api/v1/users';

  private readonly http = inject(HttpClient);
  private readonly notifyService = inject(NotifyService);

  public getCurrentUserSummary(): Observable<UserSummaryInfo | null> {
    return this.http.get<ApiResponse<UserSummaryInfo>>(`${UserService.API_URL}/summary-info`).pipe(
      map(response => response.data ?? null),
      catchError(error => {
        console.error('Failed to fetch user summary:', error);
        return of(null);
      })
    );
  }

  public getCustomers(payload: any): Observable<PageableResponse<CustomerItemRes> | null> {
    return this.http.post<ApiResponse<PageableResponse<CustomerItemRes>>>(`${UserService.API_URL}/customers/search`, payload).pipe(
      map(response => response.data ?? null),
      catchError(error => {
        console.error('Failed to fetch customers:', error);
        this.notifyService.notifyError('Lỗi', 'Lỗi khi tải danh sách khách hàng');
        return of(null);
      })
    );
  }

  public getUsers(payload: any): Observable<PageableResponse<DasUserItemRes> | null> {
    return this.http.post<ApiResponse<PageableResponse<DasUserItemRes>>>(`${UserService.API_URL}/search`, payload).pipe(
      map(response => response.data ?? null),
      catchError(error => {
        console.error('Failed to fetch users:', error);
        this.notifyService.notifyError('Lỗi', 'Lỗi khi tải danh sách người dùng');
        return of(null);
      })
    );
  }

  public createUser(payload: any): Observable<HttpResponse<ApiResponse<void>>> {
    return this.http.post<HttpResponse<ApiResponse<void>>>(`${UserService.API_URL}`, payload).pipe(
      catchError(error => {
        console.error('Failed to create user:', error);
        return throwError(() => error);
      })
    );
  }

  public updateUser(payload: any): Observable<HttpResponse<ApiResponse<void>>> {
    return this.http.put<HttpResponse<ApiResponse<void>>>(`${UserService.API_URL}`, payload).pipe(
      catchError(error => {
        console.error('Failed to update user:', error);
        return throwError(() => error);
      })
    );
  }

  public deleteUser(id: number): Observable<string> {
    return this.http.delete<ApiResponse<void>>(`${UserService.API_URL}/${id}`).pipe(
      map(res => res?.code),
      catchError(error => {
        console.error('Failed to delete user:', error);
        return throwError(() => error);
      })
    );
  }

  public getUserDetail(id: number): Observable<DasUserDetailRes> {
    return this.http.get<ApiResponse<DasUserDetailRes>>(`${UserService.API_URL}/${id}`).pipe(
      map(response => response.data!),
      catchError(error => {
        console.error('Failed to fetch user detail:', error);
        this.notifyService.notifyError('Lỗi', 'Lỗi khi tải chi tiết người dùng');
        return throwError(() => error);
      })
    );
  }
}
