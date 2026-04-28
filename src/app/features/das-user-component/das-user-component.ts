import { Component, inject, OnDestroy, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { UserService } from '../../core/services/user-service';
import { DasUserDetailRes, DasUserItemRes } from '../../core/dto/user';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PageableResponse } from '../../core/dto/api-response';
import { PaginationComponent } from "../pagination-component/pagination-component";
import { debounceTime, distinctUntilChanged, filter, Subject, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { formatUserRole, formatUserStatus } from '../../core/common/formatter';
import { NotifyService } from '../../core/common/notify-service';
import { ButtonGridComponent } from '../../shared/button-grid-component/button-grid-component';
import { TuiDialogService } from '@taiga-ui/core';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-das-user-component',
  imports: [AgGridAngular, CommonModule, FormsModule, ReactiveFormsModule, PaginationComponent],
  templateUrl: './das-user-component.html',
  styleUrl: './das-user-component.css',
  providers: [DatePipe]
})
export class DasUserComponent implements OnDestroy {
  private userService = inject(UserService);
  private datePipe = inject(DatePipe);
  private fb = inject(FormBuilder);
  private notifyService = inject(NotifyService);
  private dialogService = inject(TuiDialogService);

  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;

  isCreateModalOpen = signal(false);
  isDetailModalOpen = signal(false);
  createUserForm!: FormGroup;

  inputEmailFilter = signal('');
  inputRoleFilter = signal('');
  inputStatusFilter = signal<boolean | null>(null);

  roleFilter = toSignal(toObservable(this.inputRoleFilter).pipe(debounceTime(0), distinctUntilChanged()), { initialValue: '' });
  statusFilter = toSignal(toObservable(this.inputStatusFilter).pipe(debounceTime(0), distinctUntilChanged()), { initialValue: null as boolean | null });

  emailSubject = new Subject<string>();

  constructor() {
    this.emailSubject.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((email) => {
      this.inputEmailFilter.set(email);
      this.currentPage.set(1);
    });

    this.createUserForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.maxLength(255)]],
      role: ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.emailSubject.complete();
  }

  onEmailChange(email: string) {
    this.emailSubject.next(email);
  }

  protected currentPage = signal(1);
  protected selectedUser = signal<DasUserDetailRes | null>(null);

  protected defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true
  }

  protected colDefs: ColDef[] = [
    { field: 'STT', valueGetter: 'node.rowIndex+1', pinned: 'left', width: 70, flex: 0, minWidth: 70 },
    {
      field: 'fullName',
      headerName: "Tên người dùng",
      cellStyle: { cursor: 'pointer', fontWeight: '500', hover: 'pointer' },
      onCellClicked: (params) => { this.openViewModal(params.data.id); }
    },
    { field: 'email', headerName: "Email", minWidth: 200 },
    {
      field: 'role', headerName: "Vai trò",
      valueFormatter: (params) => formatUserRole(params.value)
    },
    { field: 'createdAt', headerName: "Ngày tạo", valueFormatter: (params) => params.value ? (this.datePipe.transform(params.value, 'dd/MM/yyyy') ?? '') : '' },
    {
      field: 'active', headerName: "Trạng thái",
      cellRenderer: (params: any) => {
        const isActive = params.value;
        const statusClass = isActive ? 'status-confirmed' : 'status-cancelled';
        const text = formatUserStatus(isActive);
        return `<span class="table-badge ${statusClass}">${text}</span>`;
      }
    },
    {
      field: 'id',
      headerName: "Thao tác",
      cellRenderer: ButtonGridComponent,
      cellRendererParams: {
        editCallback: (id: number) => this.editUser(id),
        deleteCallback: (id: number) => this.deleteUser(id)
      }
    }
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

  protected usersResource = rxResource({
    params: () => ({
      email: this.inputEmailFilter() || null,
      role: this.roleFilter() || null,
      isActive: this.statusFilter(),
      page: this.currentPage() ?? 1
    }),
    stream: ({ params }) => this.userService.getUsers(params),
    defaultValue: null as PageableResponse<DasUserItemRes> | null
  });

  clearFilters() {
    this.inputEmailFilter.set('');
    this.inputRoleFilter.set('');
    this.inputStatusFilter.set(null);
    this.currentPage.set(1);
  }

  openCreateUserModal() {
    this.createUserForm.reset({
      fullName: '',
      email: '',
      password: '',
      role: ''
    });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
  }

  submitCreateUser() {
    if (this.createUserForm.valid) {
      console.log('Form data:', this.createUserForm.value);
      this.userService.createUser(this.createUserForm.value).subscribe({
        next: () => {
          this.notifyService.notifySuccess('Thành công', 'Thêm người dùng mới thành công');
          this.usersResource.reload();
          this.closeCreateModal();
        },
        error: (err) => {
          if (err.error?.code == '06') {
            this.createUserForm.get('email')?.setErrors({ duplicate: true });
          }

          const message = err.error?.message || 'Lỗi khi thêm người dùng';
          this.notifyService.notifyError('Lỗi', message);
        }
      });
    } else {
      this.createUserForm.markAllAsTouched();
    }
  }

  openViewModal(id: number) {
    this.isDetailModalOpen.set(true);
    this.userService.getUserDetail(id).subscribe((data) => { this.selectedUser.set(data), console.log(this.selectedUser()); })
  }

  editUser(id: number) {
    console.log('Edit user:', id);
  }

  deleteUser(id: number) {
    this.dialogService.open<boolean>(this.deleteConfirmDialog, {
      label: 'Xác nhận xóa',
      size: 'm',
    }).pipe(
      filter(confirmed => confirmed === true),
      switchMap(() => this.userService.deleteUser(id))
    ).subscribe({
      next: (code) => {
        if (code === '200') {
          this.notifyService.notifySuccess('Thành công', 'Xóa người dùng thành công');
          this.usersResource.reload();
        }
      },
      error: (err: any) => {
        const message = err.error?.message || 'Lỗi khi xóa người dùng';
        this.notifyService.notifyError('Lỗi', message);
      }
    })
  }

  getInitials(fullName?: string): string {
    if (!fullName) return '?';
    return fullName.trim().split(' ')
      .filter(w => w.length > 0)
      .slice(-2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  getRoleLabel(role?: string): string {
    const map: Record<string, string> = {
      CUSTOMER: 'Khách hàng',
      RECEPTIONIST: 'Lễ tân',
      MANAGER: 'Quản lý',
      SYSADMIN: 'Quản trị hệ thống',
    };
    return role ? (map[role] ?? role) : '';
  }
}
