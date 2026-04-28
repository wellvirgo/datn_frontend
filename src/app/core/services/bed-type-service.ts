import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../dto/api-response';
import { NotifyService } from '../common/notify-service';
import { BedTypeItem } from '../dto/bed-type';


@Injectable({
  providedIn: 'root',
})
export class BedTypeService {
  private static readonly API_URL = 'http://localhost:8080/api/v1/bed-types';

  private http = inject(HttpClient);
  private notifyService = inject(NotifyService);

  public getAllBedTypes(): Observable<BedTypeItem[]> {
    return this.http.get<ApiResponse<BedTypeItem[]>>(BedTypeService.API_URL)
      .pipe(
        map(response => response.data ?? []),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể tải danh sách loại giường");
          return of([]);
        })
      );
  }
}

