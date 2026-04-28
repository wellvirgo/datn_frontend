import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '../../core/dto/chart';
import { formatVND } from '../../core/common/formatter';
import { tuiDateFormatProvider, TuiTextfield, TuiLoader } from '@taiga-ui/core';
import { TuiCalendarRange, TuiInputDateRange } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { ReportService } from '../../core/services/report-service';
import { DailyRevenueTrendDto, FinancialKpiDto } from '../../core/dto/report';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, forkJoin, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-report-revenue-component',
  imports: [NgApexchartsModule, TuiTextfield, FormsModule, TuiInputDateRange, TuiCalendarRange, TuiLoader],
  templateUrl: './report-revenue-component.html',
  styleUrl: './report-revenue-component.css',
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '/' })]
})
export class ReportRevenueComponent implements OnInit {

  protected formatVND = formatVND;
  protected reportService = inject(ReportService);

  private readonly today = TuiDay.currentLocal();
  private readonly firstDay = new TuiDay(this.today.year, this.today.month, 1);

  protected dateRange = signal<TuiDayRange>(new TuiDayRange(this.firstDay, this.today));
  protected isLoading = signal<boolean>(false);

  protected kpiData = signal<FinancialKpiDto | null>(null);
  protected dailyRevenueTrend = signal<DailyRevenueTrendDto[] | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private dateRangeChange$ = toObservable(this.dateRange).pipe(
    debounceTime(500),
    tap(() => this.isLoading.set(true)),
    switchMap((dateRange) => {
      const startDate = dateRange.from.toString('YMD', '-');
      const endDate = dateRange.to.toString('YMD', '-');

      return forkJoin({
        kpi: this.reportService.getFinancialKpi(startDate, endDate),
        trend: this.reportService.getDailyRevenueTrend(startDate, endDate)
      }).pipe(
        catchError((err) => {
          console.log(err);
          return of({
            kpi: null,
            trend: null
          })
        })
      )
    })
  );

  ngOnInit(): void {
    this.dateRangeChange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      this.kpiData.set(result.kpi);
      this.dailyRevenueTrend.set(result.trend);
      this.mapDataToChart();
      this.isLoading.set(false);
    })
  }

  public chartOptions = signal<ChartOptions>({
    series: [],
    chart: {
      height: 350,
      type: "area",
    },
    dataLabels: {
      enabled: false
    },
    title: {
      text: "Biểu đồ biến động doanh thu",
      style: {
        fontFamily: 'Inter',
        fontSize: '20px',
        fontWeight: '600',
        color: 'var(--das-role-text-primary, #1C2F42)',
      }
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          fontFamily: 'Inter'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          }
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value.toString();
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value) => this.formatVND(value)
      }
    }
  });

  mapDataToChart() {
    if (!this.dailyRevenueTrend()) {
      return;
    }
    const formattedData = this.dailyRevenueTrend()!.map(item => ({
      x: item.reportDate,
      y: item.revenue
    }));

    this.chartOptions.update(options => ({
      ...options,
      series: [
        {
          name: "Doanh thu (VND)",
          data: formattedData!
        }
      ]
    }));
  }
}
