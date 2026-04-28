import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { UserService } from '../../core/services/user-service';
import { CustomerItemRes } from '../../core/dto/user';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageableResponse } from '../../core/dto/api-response';
import { PaginationComponent } from "../pagination-component/pagination-component";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { formatVND } from '../../core/common/formatter';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-das-customer',
  imports: [AgGridAngular, CommonModule, FormsModule, PaginationComponent],
  templateUrl: './das-customer.html',
  styleUrl: './das-customer.css',
})
export class DasCustomer implements OnDestroy {
  private userService = inject(UserService);

  inputNameFilter = signal('');
  inputPhoneFilter = signal('');
  inputEmailFilter = signal('');

  nameSubject = new Subject<string>();
  phoneSubject = new Subject<string>();
  emailSubject = new Subject<string>();

  constructor() {
    this.nameSubject.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(value => {
      this.inputNameFilter.set(value);
      this.currentPage.set(1);
    });
    this.phoneSubject.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(value => {
      this.inputPhoneFilter.set(value);
      this.currentPage.set(1);
    });
    this.emailSubject.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(value => {
      this.inputEmailFilter.set(value);
      this.currentPage.set(1);
    });
  }

  ngOnDestroy(): void {
    this.nameSubject.complete();
    this.phoneSubject.complete();
    this.emailSubject.complete();
  }

  protected currentPage = signal(1);

  protected defaultColDef: ColDef = {
    flex: 1,
    minWidth: 200,
    resizable: true
  }

  protected colDefs: ColDef[] = [
    { field: 'STT', valueGetter: 'node.rowIndex+1', pinned: 'left', width: 70, flex: 0, minWidth: 70 },
    { field: 'fullName', headerName: "Tên khách hàng", },
    { field: 'email', headerName: "Email" },
    { field: 'phone', headerName: "Số điện thoại" },
    { field: 'totalBooking', headerName: "Tổng đặt phòng", valueFormatter: (params) => params.value + ' lần' },
    {
      field: 'totalSpent', headerName: "Tổng chi tiêu",
      valueFormatter: (params) => formatVND(params.value),
      cellStyle: { fontWeight: 600, color: 'var(--das-semantic-success)' }
    },
  ];

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

  protected customersResource = rxResource({
    params: () => ({
      fullName: this.inputNameFilter() ?? null,
      email: this.inputEmailFilter() ?? null,
      phone: this.inputPhoneFilter() ?? null,
      page: this.currentPage() ?? 1
    }),
    stream: ({ params }) => this.userService.getCustomers(params),
    defaultValue: null as PageableResponse<CustomerItemRes> | null
  });

  onNameChange(value: string) {
    this.nameSubject.next(value);
  }

  onPhoneChange(value: string) {
    this.phoneSubject.next(value);
  }

  onEmailChange(value: string) {
    this.emailSubject.next(value);
  }

  clearFilters() {
    this.inputNameFilter.set('');
    this.inputPhoneFilter.set('');
    this.inputEmailFilter.set('');
    this.currentPage.set(1);
  }
}
