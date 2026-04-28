import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { DailyRevenueTrendDto, FinancialKpiDto, OverviewRes } from '../dto/report';
import { ApiResponse } from '../dto/api-response';
import { NotifyService } from '../common/notify-service';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private static readonly API_URL = 'http://localhost:8080/api/v1/reports';

  private http = inject(HttpClient);
  private notifyService = inject(NotifyService);

  public getOverview(): Observable<OverviewRes | null> {
    return this.http.get<ApiResponse<OverviewRes>>(`${ReportService.API_URL}/overview`)
      .pipe(
        map(response => response.data || null),
        catchError((error) => {
          console.error('Error getting overview:', error);
          this.notifyService.notifyError("Lỗi", error.error?.message || "Không thể tải báo cáo tổng quan");
          return throwError(() => error);
        })
      );
  }

  public getFinancialKpi(startDate: string, endDate: string): Observable<FinancialKpiDto | null> {
    return this.http.get<ApiResponse<FinancialKpiDto>>(`${ReportService.API_URL}/financial-kpi?start=${startDate}&end=${endDate}`).pipe(
      map(response => response.data ?? null),
      catchError((error) => {
        console.error('Error getting financial KPI:', error);
        this.notifyService.notifyError("Lỗi", error.error?.message || "Không thể tải báo cáo tài chính");
        return of(null);
      })
    );
  }

  public getDailyRevenueTrend(startDate: string, endDate: string): Observable<DailyRevenueTrendDto[] | null> {
    return this.http.get<ApiResponse<DailyRevenueTrendDto[]>>(`${ReportService.API_URL}/daily-revenue-trend?start=${startDate}&end=${endDate}`).pipe(
      map(response => response.data ?? null),
      catchError((error) => {
        console.error('Error getting daily revenue trend:', error);
        this.notifyService.notifyError("Lỗi", error.error?.message || "Không thể tải báo cáo doanh thu hàng ngày");
        return of(null);
      })
    );
  }

}
