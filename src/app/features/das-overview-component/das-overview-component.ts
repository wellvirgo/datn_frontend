import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ReportService } from '../../core/services/report-service';
import { NotifyService } from '../../core/common/notify-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { initOverviewRes } from '../../core/dto/report';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-das-overview-component',
  imports: [CommonModule],
  templateUrl: './das-overview-component.html',
  styleUrl: './das-overview-component.css',
})
export class DasOverviewComponent implements OnInit, OnDestroy {
  protected readonly reportService = inject(ReportService);
  protected readonly notifyService = inject(NotifyService);

  protected overview = rxResource(
    {
      params: () => ({}),
      stream: () => this.reportService.getOverview(),
      defaultValue: initOverviewRes()
    }
  );

  protected currentTime: Date = new Date();
  private timer: any;

  ngOnInit() {
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  get formattedTime(): { time: string, seconds: string } {
    const hours = this.currentTime.getHours().toString().padStart(2, '0');
    const minutes = this.currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = this.currentTime.getSeconds().toString().padStart(2, '0');
    return { time: `${hours}:${minutes}`, seconds: `:${seconds}` };
  }

  get formattedDate(): string {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const day = days[this.currentTime.getDay()];
    const date = this.currentTime.getDate().toString().padStart(2, '0');
    const month = (this.currentTime.getMonth() + 1).toString().padStart(2, '0');
    const year = this.currentTime.getFullYear();
    return `${day}, ngày ${date} tháng ${month} năm ${year}`;
  }
}
