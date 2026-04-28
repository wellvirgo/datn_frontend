import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ApiResponse, PageableResponse } from '../dto/api-response';
import { BookingHistoryItemResDto, BookingRes, DasBookingDetailRes, DasBookingItemRes } from '../dto/booking';
import { DasBookingComponent } from '../../features/das-booking-component/das-booking-component';
import { NotifyService } from '../common/notify-service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  static readonly API_URL = 'http://localhost:8080/api/v1/bookings';

  private http = inject(HttpClient);
  private notifyService = inject(NotifyService);

  public createBooking(payload: any): Observable<BookingRes | null> {
    return this.http.post<ApiResponse<BookingRes>>(`${BookingService.API_URL}`, payload)
      .pipe(
        map(response => response.data || null),
        catchError((error) => {
          console.error('Error creating booking:', error);
          return throwError(() => error);
        })
      );
  }


  public getBookingHistory(payload: any): Observable<BookingHistoryItemResDto[]> {
    return this.http.post<ApiResponse<PageableResponse<BookingHistoryItemResDto>>>(`${BookingService.API_URL}/history`, payload)
      .pipe(
        map(response => response.data?.items || []),
        catchError((error) => {
          console.error('Error getting booking history:', error);
          return throwError(() => error);
        })
      );
  }

  public getDasBookings(payload: any): Observable<PageableResponse<DasBookingItemRes> | null> {
    return this.http.post<ApiResponse<PageableResponse<DasBookingItemRes>>>(`${BookingService.API_URL}/management/search`, payload)
      .pipe(
        map(response => response.data ?? null),
        catchError((error) => {
          console.error('Error getting das bookings:', error);
          this.notifyService.notifyError('Lỗi', 'Lỗi khi lấy danh sách booking');
          return of(null);
        })
      );
  }

  public getDasBookingDetail(bookingId: number): Observable<DasBookingDetailRes | null> {
    return this.http.get<ApiResponse<DasBookingDetailRes>>(`${BookingService.API_URL}/${bookingId}`)
      .pipe(
        map(response => response.data ?? null),
        catchError((error) => {
          console.error('Error getting das booking detail:', error);
          this.notifyService.notifyError('Lỗi', 'Lỗi khi lấy chi tiết booking');
          return of(null);
        })
      );
  }
}
