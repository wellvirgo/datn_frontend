import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, tuiDateFormatProvider, TuiTextfield, TuiLoader } from "@taiga-ui/core";
import { TuiInputDate } from '@taiga-ui/kit';
import { AvailbilityRoomComponent } from "../availbility-room-component/availbility-room-component";
import { FooterComponent } from "../../shared/footer-component/footer-component";
import { AvailabilityRoomTypeRes, CancellationPolicy, RoomTypeBookingInfo } from '../../core/dto/room-type';
import { RoomTypeService } from '../../core/services/room-type-service';
import { BookingButtonState } from '../../shared/booking-button-component/booking-button-state';
import { DateUtils } from '../../core/common/date-utils';
import { SideMenuComponent } from "../../shared/side-menu-component/side-menu-component";
import { CurrencyPipe, NgClass } from '@angular/common';
import { BookingService } from '../../core/services/booking-service';
import { NotifyService } from '../../core/common/notify-service';
import { HotelSettingService } from '../../core/services/hotel-setting.service';

@Component({
  selector: 'app-availability-room-result-component',
  imports: [TuiButton, TuiTextfield, TuiInputDate, FormsModule, AvailbilityRoomComponent, FooterComponent, SideMenuComponent, TuiLoader, CurrencyPipe, NgClass],
  templateUrl: './availability-room-result-component.html',
  styleUrl: './availability-room-result-component.css',
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '/' })]
})
export class AvailabilityRoomResultComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  private bookingButtonState = inject(BookingButtonState);
  private bookingService = inject(BookingService);
  private notifyService = inject(NotifyService);
  private readonly hotelSettingService = inject(HotelSettingService);

  ngOnInit(): void {
    this.loadAvailabilityResults();
  }

  protected checkIn = DateUtils.convertToTuiDay(this.bookingButtonState.checkInDate());
  protected checkOut = DateUtils.convertToTuiDay(this.bookingButtonState.checkOutDate());
  protected checkInOutPolicy = signal<any>({});
  protected availabilityResults = signal<AvailabilityRoomTypeRes[]>([]);
  protected cancellationPolicy = signal<CancellationPolicy | null>(null);

  protected isLoading = signal(false);
  protected isBooking = signal(false);
  protected selectedRooms = signal<RoomTypeBookingInfo[]>([]);

  protected totalRooms = computed(() => this.selectedRooms().reduce((sum, room) => sum + room.roomQuantity, 0));
  protected totalPrice = computed(() => this.selectedRooms().reduce((sum, room) => sum + room.price * room.roomQuantity, 0));
  protected nights = signal(0);


  protected loadAvailabilityResults() {
    this.availabilityResults.set([]);
    this.selectedRooms.set([]);
    this.isLoading.set(true);
    this.roomTypeService.checkAvailability(this.checkIn, this.checkOut).subscribe(data => {
      this.availabilityResults.set(data.availableRooms);
      this.cancellationPolicy.set(data.cancellationPolicy);
      this.isLoading.set(false);
      this.nights.set(DateUtils.getDaysDifference(this.checkIn, this.checkOut));
    });
  }

  changeBookingRoom(bookingInfo: RoomTypeBookingInfo) {
    this.selectedRooms.update(currentRooms => {
      const filteredRooms = currentRooms.filter(room => room.roomTypeId !== bookingInfo.roomTypeId);

      if (bookingInfo.roomQuantity > 0) {
        return [...filteredRooms, bookingInfo];
      }

      return filteredRooms;
    })
  }

  protected isModalOpen = signal(false);
  protected currentStep = signal<1 | 2>(1);
  protected customerName = '';
  protected customerPhone = '';

  book() {
    this.openBookingModal();
    this.hotelSettingService.getHotelCheckInOutPolicy().subscribe(policy => {
      this.checkInOutPolicy.set(policy);
    });
  }

  openBookingModal() {
    this.isModalOpen.set(true);
    this.currentStep.set(1);
    this.customerName = '';
    this.customerPhone = '';
  }

  closeBookingModal() {
    this.isModalOpen.set(false);
  }

  nextStep() {
    this.currentStep.set(2);
  }

  prevStep() {
    this.currentStep.set(1);
  }

  getRoomName(roomTypeId: number): string {
    const room = this.availabilityResults().find(r => r.id === roomTypeId);
    return room ? room.name : `Phòng ${roomTypeId}`;
  }

  confirmBooking() {
    this.isBooking.set(true);
    const payload = {
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      checkInDate: DateUtils.convertToString(this.checkIn),
      checkOutDate: DateUtils.convertToString(this.checkOut),
      nights: this.nights(),
      rooms: this.selectedRooms().map(room => ({
        roomTypeId: room.roomTypeId,
        roomQuantity: room.roomQuantity,
        adultsPerRoom: room.adultsPerRoom,
        childrenPerRoom: room.childrenPerRoom,
        price: room.price
      }))
    };
    this.bookingService.createBooking(payload).subscribe(
      {
        next: (data) => {
          this.isBooking.set(false);
          if (data && data.paymentUrl) {
            window.location.href = data.paymentUrl;
          }
        },
        error: (error) => {
          let message = null;
          if (error.error.code === '11') {
            message = "Phòng đã được đặt hết trong khoảng thời gian này. Vui lòng chọn phòng khác hoặc thay đổi ngày nhận phòng/trả phòng."
          } else {
            message = error.error.message;
          }

          this.isBooking.set(false);
          this.notifyService.notifyError('Đặt phòng thất bại', message || 'Đã có lỗi xảy ra khi tạo booking. Vui lòng thử lại sau.', 5000);
          this.closeBookingModal();
          this.loadAvailabilityResults();
        }
      }
    );
  }
}
