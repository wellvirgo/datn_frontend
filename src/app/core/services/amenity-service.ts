import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AmenityItem } from '../dto/room-type';
import { catchError, map, Observable, of } from 'rxjs';
import { NotifyService } from '../common/notify-service';
import { ApiResponse } from '../dto/api-response';

@Injectable({
  providedIn: 'root',
})
export class AmenityService {

  private readonly baseUrl = 'http://localhost:8080/api/v1/amenities';
  private readonly http = inject(HttpClient);
  private readonly notifyService = inject(NotifyService);

  public getAllAmenities(): Observable<AmenityItem[]> {
    return this.http.get<ApiResponse<AmenityItem>>(this.baseUrl).pipe(
      map((res) => (res?.data ?? []) as AmenityItem[]),
      catchError((err) => {
        console.log(err);
        this.notifyService.notifyError('Lỗi', 'Lỗi khi lấy danh sách tiện ích');
        return of([]);
      })
    );
  }

}
