import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AllCommunityModule, ColDef, ICellRendererParams, ModuleRegistry, SizeColumnsToContentStrategy, themeQuartz } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular'
import { BookingService } from '../../core/services/booking-service';
import { DasBookingDetailRes, DasBookingItemRes } from '../../core/dto/booking';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { formatBookingStatus, formatPaymentStatus, formatVND } from '../../core/common/formatter';
import { tuiDateFormatProvider, TuiTextfield } from "@taiga-ui/core";
import { TuiInputDate } from '@taiga-ui/kit';
import { PaginationComponent } from "../pagination-component/pagination-component";
import { PageableResponse } from '../../core/dto/api-response';
import { DatePipe } from '@angular/common';

ModuleRegistry.registerModules([AllCommunityModule])

@Component({
  selector: 'app-das-booking-component',
  imports: [AgGridAngular, FormsModule, TuiTextfield, TuiInputDate, PaginationComponent, DatePipe],
  templateUrl: './das-booking-component.html',
  styleUrl: './das-booking-component.css',
  providers: [tuiDateFormatProvider({ mode: 'YMD', separator: '-' })]
})
export class DasBookingComponent implements OnDestroy {

  private bookingService = inject(BookingService);

  code = signal('');
  bookingStatus = signal('');
  paymentStatus = signal('');
  startDate = signal('');
  endDate = signal('');

  currentPage = signal(1);

  codeSubject = new Subject<string>();

  constructor() {
    this.codeSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(value => {
      this.code.set(value);
      this.currentPage.set(1);
    });
  }

  ngOnDestroy(): void {
    this.codeSubject.complete();
  }

  protected autoSizeStrategy: SizeColumnsToContentStrategy = { type: 'fitCellContents' }

  protected colDefs: ColDef[] = [
    { field: 'STT', valueGetter: 'node.rowIndex+1', pinned: 'left', width: 70 },
    {
      field: 'bookingCode',
      headerName: "Mã booking",
      pinned: 'left',
      cellStyle: { cursor: 'pointer', fontWeight: '700' },
      onCellClicked: (params) => { this.openViewModal(params.data.id); }
    },
    { field: 'customerName', headerName: "Tên khách hàng" },
    { field: 'customerPhone', headerName: "Số điện thoại" },
    { field: 'stayDuration', headerName: "Thời gian lưu trú" },
    {
      field: 'bookingStatus',
      headerName: "Trạng thái booking",
      cellRenderer: (params: ICellRendererParams) => {
        const text = formatBookingStatus(params.value);
        const cssClasses: Record<string, string> = {
          'PENDING_PAYMENT': 'status-pending-payment',
          'CONFIRMED': 'status-confirmed',
          'CHECK_IN': 'status-check-in',
          'CHECK_OUT': 'status-check-out',
          'CANCELED': 'status-cancelled',
          'EXPIRED': 'status-expired',
        };
        return `<span class="table-badge ${cssClasses[params.value] ?? ''}">${text}</span>`;
      }
    },
    {
      field: 'paymentStatus',
      headerName: "Trạng thái thanh toán",
      cellRenderer: (params: ICellRendererParams) => {
        const text = formatPaymentStatus(params.value);
        const cssClasses: Record<string, string> = {
          'PAID': 'payment-paid',
          'UNPAID': 'payment-unpaid',
          'PARTIAL': 'payment-partial',
          'REFUNDED': 'payment-refunded',
          'PENDING': 'pay-pending',
          'SUCCESS': 'pay-success',
          'FAILED': 'pay-failed'
        };
        return `<span class="table-badge ${cssClasses[params.value] ?? ''}">${text}</span>`;
      }
    },
    { field: 'totalAmount', headerName: "Tổng tiền", valueFormatter: (params) => formatVND(params.value) },
    { field: 'createdAt', headerName: "Ngày đặt" },
  ]

  protected theme = themeQuartz.withParams({
    accentColor: "#633806",
    backgroundColor: "#FFFFFF",
    fontFamily: "Inter",
    foregroundColor: "#000000",
    oddRowBackgroundColor: "#85B7EB",
    headerFontFamily: ["Inter", "sans-serif"],
    headerBackgroundColor: "#042C53",
    headerTextColor: "#FFFFFF",
    headerFontSize: 16,
    headerFontWeight: 700,
    headerVerticalPaddingScale: 1.5,
    rowVerticalPaddingScale: 1.5
  });

  protected bookingsResource = rxResource({
    params: () => ({
      code: this.code() || null,
      bookingStatus: this.bookingStatus() || null,
      paymentStatus: this.paymentStatus() || null,
      startDate: this.startDate() || null,
      endDate: this.endDate() || null,
      page: this.currentPage()
    }),
    stream: ({ params }) => this.bookingService.getDasBookings(params),
    defaultValue: {
      items: [],
      page: 0,
      pageSize: 0,
      total: 0,
      totalPages: 0
    } as PageableResponse<DasBookingItemRes>
  });

  onCodeChange(value: string) {
    this.codeSubject.next(value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  clearFilters() {
    this.code.set('');
    this.bookingStatus.set('');
    this.paymentStatus.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
  }

  isViewModalOpen = signal(false);
  isLoadingSelectedBooking = signal(false);
  activeViewTab = signal(0);
  selectedBooking = signal<DasBookingDetailRes | null>(null);

  viewTabs = [
    { id: 0, title: 'Thông tin chung', icon: 'fa-circle-info' },
    { id: 1, title: 'Thông tin thanh toán', icon: 'fa-money-bill' },
    { id: 2, title: 'Phòng đã đặt', icon: 'fa-door-open' },
    { id: 3, title: 'Lịch sử thanh toán', icon: 'fa-clock-rotate-left' }
  ];

  formatVND = formatVND;
  formatBookingStatus = formatBookingStatus;
  formatPaymentStatus = formatPaymentStatus;

  openViewModal(bookingId: number) {
    this.isLoadingSelectedBooking.set(true);
    this.selectedBooking.set(null);
    this.activeViewTab.set(0);
    this.isViewModalOpen.set(true);
    this.bookingService.getDasBookingDetail(bookingId).subscribe(res => {
      if (res) {
        this.selectedBooking.set(res);
      }
      this.isLoadingSelectedBooking.set(false);
    });
  }

  closeViewModal() {
    this.isViewModalOpen.set(false);
  }

  setViewTab(tabId: number) {
    this.activeViewTab.set(tabId);
  }
}
