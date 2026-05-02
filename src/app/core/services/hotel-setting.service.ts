import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../dto/api-response';
import { HttpClient, HttpContext } from '@angular/common/http';
import { IS_PUBLIC_API } from '../auth/auth-service';

@Injectable({
  providedIn: 'root',
})
export class HotelSettingService {
  private readonly API_BASE_URL = 'http://localhost:8080/api/v1/hotel-settings';
  private readonly httpClient = inject(HttpClient);

  getHotelCheckInOutPolicy(): Observable<any> {
    return this.httpClient.get<ApiResponse<any>>(
      `${this.API_BASE_URL}/check-in-out-policy`,
      {
        context: new HttpContext().set(IS_PUBLIC_API, true),
      },).pipe(
        map((response) => response.data ?? {}),
        catchError((error) => {
          console.log(error);
          return of({});
        })
      );
  }
}
