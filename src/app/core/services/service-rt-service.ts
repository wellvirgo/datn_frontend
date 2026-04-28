import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { NotifyService } from '../common/notify-service';
import { ApiResponse } from '../dto/api-response';
import { ServiceItem } from '../dto/room-type';


@Injectable({
  providedIn: 'root',
})
export class ServiceRtService {
  private readonly baseUrl = 'http://localhost:8080/api/v1/services';
  private readonly http = inject(HttpClient);
  private readonly notifyService = inject(NotifyService);

  public getAllServiceRoomTypes(): Observable<ServiceItem[]> {
    return this.http.get<ApiResponse<ServiceItem>>(this.baseUrl).pipe(
      map((res) => (res?.data ?? []) as ServiceItem[]),
      catchError((err) => {
        console.log(err);
        this.notifyService.notifyError('Lỗi', 'Lỗi khi lấy danh sách dịch vụ phòng');
        return of([]);
      })
    );
  }
}
