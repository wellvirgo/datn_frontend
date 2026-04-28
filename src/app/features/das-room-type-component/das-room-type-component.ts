import { Component, computed, inject, OnDestroy, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoomTypeService } from '../../core/services/room-type-service';
import { BedTypeService } from '../../core/services/bed-type-service';
import { PageableResponse } from '../../core/dto/api-response';
import { AmenityItem, RoomTypeDetailDto, RoomTypeItemRes, ServiceItem } from '../../core/dto/room-type';
import { debounceTime, distinctUntilChanged, filter, forkJoin, Subject, switchMap, timer } from 'rxjs';
import { RoomTypeFallbackImgPipe } from '../../core/common/pipe/room-type-fallback-img-pipe';
import { NotifyService } from '../../core/common/notify-service';
import { BedTypeItem } from '../../core/dto/bed-type';
import { TuiDialogService } from '@taiga-ui/core';
import { AuthService } from '../../core/auth/auth-service';
import { AmenityService } from '../../core/services/amenity-service';
import { ServiceRtService } from '../../core/services/service-rt-service';

const EMPTY_PAGE: PageableResponse<RoomTypeItemRes> = {
  items: [],
  page: 1,
  pageSize: 6,
  total: 0,
  totalPages: 0,
};

@Component({
  selector: 'app-das-room-type-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RoomTypeFallbackImgPipe],
  templateUrl: './das-room-type-component.html',
  styleUrl: './das-room-type-component.css',
})
export class DasRoomTypeComponent implements OnDestroy {
  private roomTypeService = inject(RoomTypeService);
  private bedTypeService = inject(BedTypeService);
  private fb = inject(FormBuilder);
  private notifyService = inject(NotifyService);
  protected readonly authService = inject(AuthService);
  private readonly dialogService = inject(TuiDialogService);
  protected readonly amenityService = inject(AmenityService);
  protected readonly serviceRtService = inject(ServiceRtService);

  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;

  searchQuery = signal<string>('');
  searchSubject = new Subject<string>();

  searchPayload = signal<any>({
    page: 1,
    size: 6,
    roomTypeName: null,
  });

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchPayload.update(p => ({
        ...p,
        page: 1,
        roomTypeName: query.trim() || null,
      }));
    });

    this.roomTypeForm.get('extraBedAllowed')!.valueChanges.subscribe((allowed: boolean) => {
      const priceCtrl = this.roomTypeForm.get('extraBedPrice')!;
      if (allowed) {
        priceCtrl.enable();
        priceCtrl.setValidators([Validators.required, Validators.min(0)]);
      } else {
        priceCtrl.disable();
        priceCtrl.clearValidators();
        priceCtrl.setValue(null);
        this.extraBedPriceDisplay.set('');
      }
      priceCtrl.updateValueAndValidity();
    });

    this.roomTypeForm.get('baseAdults')!.valueChanges.subscribe((val: number) => {
      const maxCtrl = this.roomTypeForm.get('maxAdults')!;
      const baseVal = Number(val) || 0;
      if (maxCtrl.value < baseVal) {
        maxCtrl.setValue(baseVal);
      }
      maxCtrl.setValidators([Validators.required, Validators.min(baseVal), Validators.max(20)]);
      maxCtrl.updateValueAndValidity();
    });

    this.roomTypeForm.get('baseChildren')!.valueChanges.subscribe((val: number) => {
      const maxCtrl = this.roomTypeForm.get('maxChildren')!;
      const baseVal = Number(val) || 0;
      if (maxCtrl.value < baseVal) {
        maxCtrl.setValue(baseVal);
      }
      maxCtrl.setValidators([Validators.required, Validators.min(baseVal), Validators.max(20)]);
      maxCtrl.updateValueAndValidity();
    });

    this.successTriggerForToggle$.pipe(
      switchMap(() => timer(1000)),
      takeUntilDestroyed()
    ).subscribe(() => this.editSaveSuccess.set(null));
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  // Add Modal state
  isCreateModalOpen = signal<boolean>(false);
  activeTab = signal<number>(0);

  // View Modal state
  isViewModalOpen = signal<boolean>(false);
  activeViewTab = signal<number>(0);
  selectedRoom = signal<RoomTypeDetailDto | null>(null);

  // Edit Modal state
  isEditModalOpen = signal<boolean>(false);
  activeEditTab = signal<number>(0);

  viewAmenities = computed(() => {
    const room = this.selectedRoom();
    if (!room || !room.amenities) return [];
    return room.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
  });

  viewServices = computed(() => {
    const room = this.selectedRoom();
    if (!room || !room.services) return [];
    return room.services.split(',').map((s: string) => s.trim()).filter(Boolean);
  });

  viewImages = computed(() => {
    const room = this.selectedRoom();
    if (!room || !room.roomTypeImgs) return [];
    return room.roomTypeImgs.split(',').map((s: string) => s.trim()).filter(Boolean);
  });

  otherViewImages = computed(() => {
    const room = this.selectedRoom();
    const thumbnail = room?.thumbnail;
    const allImages = this.viewImages();
    if (!thumbnail) return allImages;
    return allImages.filter(img => img !== thumbnail);
  });

  readonly viewTabs = [
    { id: 0, title: 'Thông tin cơ bản', icon: 'fa-info-circle' },
    { id: 1, title: 'Sức chứa & Giá', icon: 'fa-users' },
    { id: 2, title: 'Không gian & Giường', icon: 'fa-bed' },
    { id: 3, title: 'Hình ảnh', icon: 'fa-image' },
    { id: 4, title: 'Tiện nghi & Dịch vụ', icon: 'fa-concierge-bell' }
  ];

  // Bed types dropdown
  protected bedTypesResource = rxResource({
    params: () => ({}),
    stream: () => this.bedTypeService.getAllBedTypes(),
    defaultValue: [] as BedTypeItem[],
  });
  bedTypes = computed(() => this.bedTypesResource.value());

  protected roomsResource = rxResource({
    params: () => this.searchPayload(),
    stream: ({ params }) => this.roomTypeService.searchRoomTypes(params),
    defaultValue: EMPTY_PAGE,
  });

  paginatedRooms = computed(() => this.roomsResource.value()?.items ?? []);
  currentPage = computed(() => this.roomsResource.value()?.page ?? 1);
  totalPages = computed(() => this.roomsResource.value()?.totalPages ?? 1);

  // Image upload state
  selectedFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);

  isSubmitting = signal(false);

  // Currency display signals for formatted price inputs (Create form)
  basePriceDisplay = signal('');
  extraBedPriceDisplay = signal('');

  // Currency display signals for formatted price inputs (Edit form)
  editBasePriceDisplay = signal('');
  editExtraBedPriceDisplay = signal('');

  readonly tabs = [
    { id: 0, title: 'Thông tin cơ bản', icon: 'fa-info-circle' },
    { id: 1, title: 'Sức chứa & Giá', icon: 'fa-users' },
    { id: 2, title: 'Không gian & Giường', icon: 'fa-bed' },
    { id: 3, title: 'Hình ảnh', icon: 'fa-image' }
  ];

  // ===== Create Form =====
  roomTypeForm: FormGroup = this.fb.group({
    // Tab 0: Thông tin cơ bản
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    viewType: ['', [Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(2000)]],
    totalRooms: [1, [Validators.required, Validators.min(1)]],

    // Tab 1: Sức chứa & Giá
    baseAdults: [0, [Validators.required, Validators.min(1), Validators.max(15)]],
    baseChildren: [0, [Validators.required, Validators.min(0), Validators.max(15)]],
    maxAdults: [0, [Validators.required, Validators.min(1), Validators.max(20)]],
    maxChildren: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    basePrice: [null, [Validators.required, Validators.min(0)]],
    extraBedAllowed: [false, [Validators.required]],
    extraBedPrice: [{ value: null, disabled: true }],

    // Tab 2: Không gian & Giường
    bedTypeId: [null, [Validators.required]],
    bedArrangement: ['', [Validators.required, Validators.maxLength(255)]],
    areaSize: [null, [Validators.required, Validators.min(5)]],
    smokingPolicy: ['', [Validators.required]],
    bathroomType: ['', [Validators.required]],
  });

  isFieldInvalid(controlName: string): boolean {
    const control = this.roomTypeForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.roomTypeForm.get(controlName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) {
      const labels: Record<string, string> = {
        name: 'Tên loại phòng không được để trống',
        bedTypeId: 'Cần chọn kiểu giường',
        baseAdults: 'Số người lớn tiêu chuẩn không được để trống',
        baseChildren: 'Số trẻ em tiêu chuẩn không được để trống',
        maxAdults: 'Số người lớn tối đa không được để trống',
        maxChildren: 'Số trẻ em tối đa không được để trống',
        areaSize: 'Diện tích phòng không được để trống',
        bedArrangement: 'Cách bố trí giường không được để trống',
        extraBedAllowed: 'Cần xác định phòng có cho phép thêm giường phụ không',
        basePrice: 'Giá cơ bản không được để trống',
        extraBedPrice: 'Giá giường phụ không được để trống',
        smokingPolicy: 'Cần thiết lập chính sách hút thuốc',
        bathroomType: 'Loại phòng tắm không được để trống',
        totalRooms: 'Số lượng phòng không được để trống',
      };
      return labels[controlName] || 'Trường này không được để trống';
    }

    if (errors['minlength']) {
      return `Tối thiểu ${errors['minlength'].requiredLength} ký tự`;
    }
    if (errors['maxlength']) {
      return `Tối đa ${errors['maxlength'].requiredLength} ký tự`;
    }
    if (errors['min']) {
      if (controlName === 'maxAdults') {
        return `Không được nhỏ hơn người lớn tiêu chuẩn (${errors['min'].min})`;
      }
      if (controlName === 'maxChildren') {
        return `Không được nhỏ hơn trẻ em tiêu chuẩn (${errors['min'].min})`;
      }
      return `Giá trị tối thiểu là ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Giá trị tối đa là ${errors['max'].max}`;
    }

    return 'Giá trị không hợp lệ';
  }

  // Check if a specific tab has any invalid fields
  isTabInvalid(tabIndex: number): boolean {
    const tabFields: Record<number, string[]> = {
      0: ['name', 'viewType', 'description', 'totalRooms'],
      1: ['baseAdults', 'baseChildren', 'maxAdults', 'maxChildren', 'basePrice', 'extraBedAllowed', 'extraBedPrice'],
      2: ['bedTypeId', 'bedArrangement', 'areaSize', 'smokingPolicy', 'bathroomType'],
    };
    const fields = tabFields[tabIndex];
    if (!fields) return false;
    return fields.some(f => {
      const ctrl = this.roomTypeForm.get(f);
      return ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
    });
  }

  // Currency formatting
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  onPriceInput(event: Event, controlName: 'basePrice' | 'extraBedPrice'): void {
    const input = event.target as HTMLInputElement;
    // Strip non-digit chars except minus
    const raw = input.value.replace(/[^\d]/g, '');
    const numericValue = raw ? Number(raw) : null;

    this.roomTypeForm.get(controlName)!.setValue(numericValue);
    this.roomTypeForm.get(controlName)!.markAsDirty();

    const displaySignal = controlName === 'basePrice' ? this.basePriceDisplay : this.extraBedPriceDisplay;
    displaySignal.set(numericValue !== null ? this.formatCurrency(numericValue) : '');
  }

  submitForm(): void {
    this.roomTypeForm.markAllAsTouched();

    if (this.roomTypeForm.invalid) {
      for (let i = 0; i <= 3; i++) {
        if (this.isTabInvalid(i)) {
          this.activeTab.set(i);
          break;
        }
      }
      return;
    }

    const formValue = this.roomTypeForm.value;
    const payload = {
      name: formValue.name,
      bedTypeId: Number(formValue.bedTypeId),
      baseAdults: Number(formValue.baseAdults),
      baseChildren: Number(formValue.baseChildren),
      maxAdults: Number(formValue.maxAdults),
      maxChildren: Number(formValue.maxChildren),
      areaSize: Number(formValue.areaSize),
      bedArrangement: formValue.bedArrangement,
      viewType: formValue.viewType || null,
      extraBedAllowed: formValue.extraBedAllowed,
      basePrice: Number(formValue.basePrice),
      extraBedPrice: formValue.extraBedAllowed ? Number(formValue.extraBedPrice) : null,
      description: formValue.description || null,
      smokingPolicy: formValue.smokingPolicy,
      bathroomType: formValue.bathroomType,
      totalRooms: Number(formValue.totalRooms),
    };

    console.log(payload);

    const formData = new FormData();
    if (this.selectedFile()) {
      formData.append('thumbnail', this.selectedFile()!)
    }
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    this.isSubmitting.set(true);
    this.roomTypeService.createRoomType(formData).subscribe({
      next: (code) => {
        if (code === '200') {
          this.notifyService.notifySuccess("Thành công", "Tạo loại phòng thành công");
          this.closeModal();
          this.roomTypeService.refreshTotalRooms();
        }
        this.searchPayload.set({
          page: 1,
          size: 6,
          roomTypeName: null,
        });
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  resetForm(): void {
    this.roomTypeForm.reset({
      name: '',
      viewType: '',
      description: '',
      baseAdults: 0,
      baseChildren: 0,
      maxAdults: 0,
      maxChildren: 0,
      basePrice: null,
      extraBedAllowed: false,
      extraBedPrice: null,
      bedTypeId: null,
      bedArrangement: '',
      areaSize: null,
      smokingPolicy: '',
      bathroomType: '',
      totalRooms: 0,
    });
    const priceCtrl = this.roomTypeForm.get('extraBedPrice')!;
    priceCtrl.disable();
    priceCtrl.clearValidators();
    priceCtrl.updateValueAndValidity();

    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);

    this.basePriceDisplay.set('');
    this.extraBedPriceDisplay.set('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.notifyService.notifyError('Lỗi', 'Ảnh không đúng định dạng');
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.notifyService.notifyError('Lỗi', 'Ảnh vượt quá kích thước cho phép (tối đa 5MB)');
      return;
    }

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
  }

  updateSearch(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  deleteRoomType(id: number, name: string) {
    this.dialogService.open<boolean>(this.deleteConfirmDialog, {
      label: 'Xác nhận xóa',
      size: 'm',
    })
      .pipe(
        filter(isConfirmed => isConfirmed === true),
        switchMap(() => this.roomTypeService.deleteRoomTypes(id)))
      .subscribe({
        next: (code) => {
          if (code === '200') {
            this.notifyService.notifySuccess("Thành công", "Xóa loại phòng thành công");
            this.searchPayload.update(p => ({ ...p, page: 1 }));
          }
        },
        error: (err) => {
          this.notifyService.notifyError("Lỗi", err.error?.message || "Không thể xóa loại phòng");
        }
      });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.searchPayload.update(p => ({ ...p, page }));
    }
  }

  getPagesArray(): number[] {
    const total = this.totalPages();
    const arr: number[] = [];
    for (let i = 1; i <= total; i++) {
      arr.push(i);
    }
    return arr;
  }

  openModal() {
    this.resetForm();
    this.isCreateModalOpen.set(true);
    this.activeTab.set(0);
  }

  closeModal() {
    this.isCreateModalOpen.set(false);
  }

  setTab(index: number) {
    this.activeTab.set(index);
  }

  openViewModal(id: number) {
    this.roomTypeService.getDetailRoomTypeById(id).subscribe(room => {
      this.selectedRoom.set(room)
    });
    this.activeViewTab.set(0);
    this.isViewModalOpen.set(true);
  }

  closeViewModal() {
    this.isViewModalOpen.set(false);
    setTimeout(() => this.selectedRoom.set(null), 300);
  }

  setViewTab(index: number) {
    this.activeViewTab.set(index);
  }

  // Code for edit modal
  basicForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    viewType: [''],
    totalRooms: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  capacityForm: FormGroup = this.fb.group({
    baseAdults: [0, [Validators.required, Validators.min(1)]],
    baseChildren: [0, Validators.min(0)],
    maxAdults: [0, [Validators.required, Validators.min(1)]],
    maxChildren: [0, Validators.min(0)],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    extraBedAllowed: [false],
    extraBedPrice: [0, Validators.min(0)],
  });

  bedSpaceForm: FormGroup = this.fb.group({
    bedTypeId: [null, Validators.required],
    bedArrangement: ['', [Validators.required, Validators.maxLength(255)]],
    areaSize: [0, [Validators.required, Validators.min(5)]],
    smokingPolicy: ['', Validators.required],
    bathroomType: ['', Validators.required],
  });

  readonly editTabs = [
    { id: 0, title: 'Thông tin cơ bản', icon: 'fa-circle-info', form: this.basicForm },
    { id: 1, title: 'Sức chứa & Giá', icon: 'fa-sack-dollar', form: this.capacityForm },
    { id: 2, title: 'Giường & Không gian', icon: 'fa-bed', form: this.bedSpaceForm },
    { id: 3, title: 'Hình ảnh', icon: 'fa-images', form: null },
    { id: 4, title: 'Tiện nghi & Dịch vụ', icon: 'fa-spa', form: null },
  ];

  isEditSaving = signal<boolean>(false);
  editSaveSuccess = signal<number | null>(null);
  math = Math;
  editAmenities = signal<AmenityItem[]>([]);
  editServices = signal<ServiceItem[]>([]);
  currentEditTab = signal<FormGroup | null>(this.basicForm);
  successTriggerForToggle$ = new Subject<void>();

  readonly smokingOptions = [
    { value: 'NO_SMOKING', label: 'Cấm hút thuốc', labelMask: 'No smoking' },
    { value: 'NOT_IN_ROOM', label: 'Không hút thuốc trong phòng', labelMask: 'Not in room' },
    { value: 'IN_ALLOWED_AREA', label: 'Cho phép hút thuốc tại khu vực quy định', labelMask: 'In allowed area' },
  ];

  get editExtraBedAllowed(): boolean {
    return !!this.capacityForm.get('extraBedAllowed')?.value;
  }

  // Validation helpers for Edit forms
  isEditFieldInvalid(form: 'basic' | 'capacity' | 'bedSpace', controlName: string): boolean {
    const formGroup = form === 'basic' ? this.basicForm
      : form === 'capacity' ? this.capacityForm
        : this.bedSpaceForm;
    const control = formGroup.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getEditErrorMessage(form: 'basic' | 'capacity' | 'bedSpace', controlName: string): string {
    const formGroup = form === 'basic' ? this.basicForm
      : form === 'capacity' ? this.capacityForm
        : this.bedSpaceForm;
    const control = formGroup.get(controlName);
    if (!control || !control.errors) return '';
    const errors = control.errors;

    if (errors['required']) {
      const labels: Record<string, string> = {
        name: 'Tên loại phòng không được để trống',
        totalRooms: 'Số lượng phòng không được để trống',
        baseAdults: 'Số người lớn tiêu chuẩn không được để trống',
        baseChildren: 'Số trẻ em tiêu chuẩn không được để trống',
        maxAdults: 'Số người lớn tối đa không được để trống',
        maxChildren: 'Số trẻ em tối đa không được để trống',
        basePrice: 'Giá cơ bản không được để trống',
        extraBedPrice: 'Giá giường phụ không được để trống',
        bedTypeId: 'Cần chọn loại giường',
        bedArrangement: 'Cách bố trí giường không được để trống',
        areaSize: 'Diện tích phòng không được để trống',
        smokingPolicy: 'Cần thiết lập chính sách hút thuốc',
        bathroomType: 'Loại phòng tắm không được để trống',
      };
      return labels[controlName] || 'Trường này không được để trống';
    }
    if (errors['minlength']) return `Tối thiểu ${errors['minlength'].requiredLength} ký tự`;
    if (errors['maxlength']) return `Tối đa ${errors['maxlength'].requiredLength} ký tự`;
    if (errors['min']) {
      if (controlName === 'maxAdults') return `Không được nhỏ hơn người lớn tiêu chuẩn (${errors['min'].min})`;
      if (controlName === 'maxChildren') return `Không được nhỏ hơn trẻ em tiêu chuẩn (${errors['min'].min})`;
      if (controlName === 'areaSize') return `Diện tích tối thiểu là ${errors['min'].min} m²`;
      if (controlName === 'basePrice') return `Giá phải lớn hơn hoặc bằng 0`;
      return `Giá trị tối thiểu là ${errors['min'].min}`;
    }
    if (errors['max']) return `Giá trị tối đa là ${errors['max'].max}`;
    return 'Giá trị không hợp lệ';
  }

  onEditPriceInput(event: Event, controlName: 'basePrice' | 'extraBedPrice'): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/[^\d]/g, '');
    const numericValue = raw ? Number(raw) : null;

    this.capacityForm.get(controlName)!.setValue(numericValue);
    this.capacityForm.get(controlName)!.markAsDirty();
    this.capacityForm.get(controlName)!.markAsTouched();

    const displaySignal = controlName === 'basePrice' ? this.editBasePriceDisplay : this.editExtraBedPriceDisplay;
    displaySignal.set(numericValue !== null ? this.formatCurrency(numericValue) : '');
  }

  openEditModal(id: number): void {
    this.isEditModalOpen.set(true);
    forkJoin({
      room: this.roomTypeService.getDetailRoomTypeById(id),
      amenities: this.amenityService.getAllAmenities(),
      services: this.serviceRtService.getAllServiceRoomTypes()
    }).subscribe({
      next: (res) => {
        this.selectedRoom.set(res.room);
        this.editAmenities.set(res.amenities);
        this.editServices.set(res.services);

        this.setEditTab(0);
        this.patchEditForms(res.room);
      },
      error: (err) => {
        console.log(err);
        this.notifyService.notifyError('Lỗi', 'Lỗi khi tải thông tin loại phòng');
        this.isEditModalOpen.set(false);
      }
    });
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.resetEditForm();
  }

  setEditTab(index: number): void {
    this.activeEditTab.set(index);
  }

  private patchEditForms(room: RoomTypeDetailDto): void {
    this.basicForm.patchValue({
      name: room?.name ?? '',
      viewType: room?.viewType ?? '',
      totalRooms: room?.totalRooms ?? 0,
      description: room?.description ?? '',
    });

    this.capacityForm.patchValue({
      baseAdults: room.baseAdults ?? 1,
      baseChildren: room.baseChildren ?? 0,
      maxAdults: room.maxAdults ?? 2,
      maxChildren: room.maxChildren ?? 2,
      basePrice: room.basePrice ?? 0,
      extraBedAllowed: room.extraBedAllowed ?? false,
      extraBedPrice: room.extraBedPrice ?? 0,
    });

    // Initialize formatted price display for edit form
    this.editBasePriceDisplay.set(this.formatCurrency(room.basePrice ?? 0));
    this.editExtraBedPriceDisplay.set(this.formatCurrency(room.extraBedPrice ?? 0));

    this.bedSpaceForm.patchValue({
      bedTypeId: room.bedTypeId,
      bedArrangement: room.bedArrangement ?? '',
      areaSize: room.areaSize ?? 0,
      smokingPolicy: this.smokingOptions.find(opt => opt.labelMask === room.smokingPolicy)?.value ?? '',
      bathroomType: room.bathroomType ?? '',
    });

    // Patch trạng thái checked cho tiện nghi & dịch vụ
    if (room.amenities) {
      const activeIds = room.amenities.split(',').map((s: string) => s.trim());
      this.editAmenities.update(list =>
        list.map(a => ({ ...a, checked: activeIds.includes(a.name.trim()) }))
      );
    }
    if (room.services) {
      const activeIds = room.services.split(',').map((s: string) => s.trim());
      this.editServices.update(list =>
        list.map(s => ({ ...s, checked: activeIds.includes(s.name.trim()) }))
      );
    }
  }

  private resetEditForm(): void {
    this.basicForm.reset();
    this.capacityForm.reset();
    this.bedSpaceForm.reset();
    this.editAmenities.set([]);
    this.editServices.set([]);
    this.selectedRoom.set(null);
    this.editSaveSuccess.set(null);
  }

  saveBasicInfo(): void {
    if (this.basicForm.invalid) {
      this.basicForm.markAllAsTouched();
      return;
    }

    this.isEditSaving.set(true);
    let cacheAmenities = this.selectedRoom()?.amenities ?? '';
    let cacheServices = this.selectedRoom()?.services ?? '';

    this.roomTypeService.updateBasicInfo(this.selectedRoom()!.id, this.basicForm.value).subscribe(room => {
      if (room) {
        this.editSaveSuccess.set(0);
        this.selectedRoom.set({
          ...room,
          amenities: cacheAmenities,
          services: cacheServices
        });
        this.patchEditForms(room);
        this.roomsResource.reload();
      }
      this.isEditSaving.set(false);
    });
  }

  saveCapacityAndPrice(): void {
    if (this.capacityForm.invalid) {
      this.capacityForm.markAllAsTouched();
      return;
    }

    this.isEditSaving.set(true);
    let cacheAmenities = this.selectedRoom()?.amenities ?? '';
    let cacheServices = this.selectedRoom()?.services ?? '';

    this.roomTypeService.updateOccupancyAndPrice(this.selectedRoom()!.id, this.capacityForm.value).subscribe(room => {
      if (room) {
        this.editSaveSuccess.set(1);
        this.selectedRoom.set({
          ...room,
          amenities: cacheAmenities,
          services: cacheServices
        });
        this.patchEditForms(room);
        this.roomsResource.reload();
      }
      this.isEditSaving.set(false);
    });
  }

  saveBedAndSpace(): void {
    if (this.bedSpaceForm.invalid) {
      this.bedSpaceForm.markAllAsTouched();
      return;
    }

    console.log(this.bedSpaceForm.value);

    this.isEditSaving.set(true);
    let cacheAmenities = this.selectedRoom()?.amenities ?? '';
    let cacheServices = this.selectedRoom()?.services ?? '';

    this.roomTypeService.updateRoomSpace(this.selectedRoom()!.id, this.bedSpaceForm.value).subscribe(room => {
      if (room) {
        this.editSaveSuccess.set(2);
        this.selectedRoom.set({
          ...room,
          amenities: cacheAmenities,
          services: cacheServices
        });
        this.patchEditForms(room);
        this.roomsResource.reload();
      }
      this.isEditSaving.set(false);
    });
  }

  toggleEditAmenity(name: string): void {
    this.editAmenities.update(list =>
      list.map(a => a.name.trim() === name.trim() ? { ...a, checked: !a.checked } : a)
    );
    const selected = this.editAmenities().filter(a => a.checked).map(a => a.id);
    this.roomTypeService.updateAmenities(this.selectedRoom()!.id, { amenityIds: selected }).subscribe(room => {
      if (room) {
        this.editSaveSuccess.set(4);
        this.selectedRoom.set(room);
        this.patchEditForms(room);
        this.roomsResource.reload();
        this.successTriggerForToggle$.next();
      }
    });
  }

  toggleEditService(name: string): void {
    this.editServices.update(list =>
      list.map(s => s.name.trim() === name.trim() ? { ...s, checked: !s.checked } : s)
    );
    const selected = this.editServices().filter(s => s.checked).map(s => s.id);
    this.roomTypeService.updateServices(this.selectedRoom()!.id, { serviceIds: selected }).subscribe(room => {
      if (room) {
        this.editSaveSuccess.set(4);
        this.selectedRoom.set(room);
        this.patchEditForms(room);
        this.roomsResource.reload();
        this.successTriggerForToggle$.next();
      }
    });
  }

  public nextTab(nextTab: number, nextForm: FormGroup | null) {
    if (nextForm === null) {
      this.setEditTab(nextTab);
      return;
    }

    const isDirty = this.currentEditTab()?.dirty;

    if (isDirty) {
      console.log("Form đang được sửa");
    }

    this.setEditTab(nextTab);
    this.currentEditTab.set(nextForm);

  }
}