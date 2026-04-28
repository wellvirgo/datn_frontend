import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ApiResponse, PageableResponse } from '../dto/api-response';
import { AvailabilityRoomTypeRes, CheckAvailabilityRes, PublicDetailRoomTypeRes, RoomTypeDetailDto, RoomTypeItemRes, RoomTypeSummaryItemRes } from '../dto/room-type';
import { IS_PUBLIC_API } from '../auth/auth-service';
import { NotifyService } from '../common/notify-service';
import { TuiDay } from '@taiga-ui/cdk';
import { DateUtils } from '../common/date-utils';

@Injectable({
  providedIn: 'root',
})
export class RoomTypeService {
  private static readonly API_URL = 'http://localhost:8080/api/v1/room-types';

  private http: HttpClient = inject(HttpClient);
  private notifyService = inject(NotifyService);

  totalRoomsRefreshTrigger = signal(0);
  refreshTotalRooms(): void {
    this.totalRoomsRefreshTrigger.update(v => v + 1);
  }

  public getActiveRoomTypes(payload: any): Observable<PageableResponse<RoomTypeSummaryItemRes>> {
    return this.http.post<ApiResponse<PageableResponse<RoomTypeSummaryItemRes>>>(`${RoomTypeService.API_URL}/active`, payload,
      {
        context: new HttpContext().set(IS_PUBLIC_API, true),
      }
    ).pipe(
      map(response => response.data!),
      catchError((err) => {
        this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể tải danh sách loại phòng");
        return of({
          items: [],
          page: 0,
          pageSize: 0,
          total: 0,
          totalPages: 0,
        });
      })
    );
  }

  public checkAvailability(checkIn: TuiDay, checkOut: TuiDay): Observable<CheckAvailabilityRes> {
    const payload = {
      "checkIn": DateUtils.convertToString(checkIn),
      "checkOut": DateUtils.convertToString(checkOut),
    }

    return this.http.post<ApiResponse<CheckAvailabilityRes>>(`${RoomTypeService.API_URL}/availability`, payload, {
      context: new HttpContext().set(IS_PUBLIC_API, true),
    }).pipe(
      map(response => response.data!),
      catchError((err) => {
        this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể kiểm tra tình trạng phòng")
        return of({
          searchCriteria: {
            checkIn: '',
            checkOut: '',
            nights: 0
          },
          cancellationPolicy: {
            status: '',
            displayText: '',
            rawPolicy: []
          },
          availableRooms: []
        });
      })
    );
  }

  public getPublicDetailRoomType(id: number): Observable<PublicDetailRoomTypeRes> {
    return this.http.get<ApiResponse<PublicDetailRoomTypeRes>>(`${RoomTypeService.API_URL}/${id}`, {
      context: new HttpContext().set(IS_PUBLIC_API, true),
    }).pipe(
      map(response => response.data!),
      catchError((err) => {
        this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể tải chi tiết loại phòng")
        return throwError(() => err);
      })
    );
  }

  public createRoomType(payload: any): Observable<string> {
    return this.http.post<ApiResponse<RoomTypeItemRes>>(`${RoomTypeService.API_URL}`, payload)
      .pipe(
        map(response => response.code!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể tạo loại phòng")
          return of('500');
        })
      );
  }

  public getTotalRooms(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${RoomTypeService.API_URL}/total-rooms`)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể tải tổng số phòng")
          return of(0);
        })
      );
  }

  public searchRoomTypes(payload: any): Observable<PageableResponse<RoomTypeItemRes>> {
    return this.http.post<ApiResponse<PageableResponse<RoomTypeItemRes>>>(`${RoomTypeService.API_URL}/search`, payload)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể tìm kiếm loại phòng")
          return of({
            items: [],
            page: 0,
            pageSize: 0,
            total: 0,
            totalPages: 0,
          });
        })
      );
  }

  public deleteRoomTypes(id: number): Observable<string> {
    return this.http.delete<ApiResponse<void>>(`${RoomTypeService.API_URL}/${id}`)
      .pipe(
        map(response => response.code!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể xóa loại phòng")
          return of('500');
        })
      );
  }

  public getDetailRoomTypeById(id: number): Observable<RoomTypeDetailDto> {
    return this.http.get<ApiResponse<RoomTypeDetailDto>>(`${RoomTypeService.API_URL}/details/${id}`)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể tải chi tiết loại phòng")
          return throwError(() => err);
        })
      );
  }

  public updateBasicInfo(id: number, payload: any): Observable<RoomTypeDetailDto | null> {
    return this.http.patch<ApiResponse<RoomTypeDetailDto>>(`${RoomTypeService.API_URL}/${id}/basic-info`, payload)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể cập nhật thông tin cơ bản")
          return of(null);
        })
      );
  }

  public updateOccupancyAndPrice(id: number, payload: any): Observable<RoomTypeDetailDto | null> {
    return this.http.patch<ApiResponse<RoomTypeDetailDto>>(`${RoomTypeService.API_URL}/${id}/occupancy`, payload)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể cập nhật sức chứa và giá")
          return of(null);
        })
      );
  }

  public updateRoomSpace(id: number, payload: any): Observable<RoomTypeDetailDto | null> {
    return this.http.patch<ApiResponse<RoomTypeDetailDto>>(`${RoomTypeService.API_URL}/${id}/room-space`, payload)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể cập nhật không gian phòng")
          return of(null);
        })
      );
  }

  public updateAmenities(id: number, payload: any): Observable<RoomTypeDetailDto | null> {
    return this.http.put<ApiResponse<RoomTypeDetailDto>>(`${RoomTypeService.API_URL}/${id}/amenities`, payload)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể cập nhật tiện nghi")
          return of(null);
        })
      );
  }

  public updateServices(id: number, payload: any): Observable<RoomTypeDetailDto | null> {
    return this.http.put<ApiResponse<RoomTypeDetailDto>>(`${RoomTypeService.API_URL}/${id}/services`, payload)
      .pipe(
        map(response => response.data!),
        catchError((err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể cập nhật dịch vụ")
          return of(null);
        })
      );
  }
}
