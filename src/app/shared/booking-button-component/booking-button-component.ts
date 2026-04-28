import { AfterViewInit, Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { tuiDateFormatProvider, TuiTextfield } from '@taiga-ui/core';
import { TuiInputDate } from '@taiga-ui/kit';
import { TuiDay } from '@taiga-ui/cdk';
import { BookingButtonState } from './booking-button-state';
import { DateUtils } from '../../core/common/date-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-button-component',
  imports: [TuiInputDate, TuiTextfield, FormsModule],
  templateUrl: './booking-button-component.html',
  styleUrl: './booking-button-component.css',
  providers: [tuiDateFormatProvider({ mode: 'DMY', separator: '/' })]
})
export class BookingButtonComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.calculateThreshold();
  }

  @ViewChild('bookingButton') bookingButton!: ElementRef;

  private readonly bookingButtonState = inject(BookingButtonState);
  private readonly router = inject(Router);

  protected isSticky = signal(false);
  protected isBookingPopupOpen = signal(false);
  private threshold = 0;

  protected checkIn: TuiDay = TuiDay.currentLocal();
  protected checkOut: TuiDay = TuiDay.currentLocal().append({ day: 1 });
  protected minCheckIn: TuiDay = this.checkIn;
  protected maxCheckIn: TuiDay = this.checkIn.append({ year: 1 });
  protected minCheckOut: TuiDay = this.checkOut;
  protected maxCheckOut: TuiDay = this.checkOut.append({ year: 1 });

  protected readonly checkInHandler = (day: TuiDay): boolean => day.daySame(this.checkIn);
  protected readonly checkOutHandler = (day: TuiDay): boolean => day.daySameOrBefore(this.checkIn);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isSticky.set(window.scrollY > this.threshold);
  }


  protected toggleBookingPopup(): void {
    this.isBookingPopupOpen.set(!this.isBookingPopupOpen());
  }

  protected searchAvailability(): void {
    this.bookingButtonState.checkInDate.set(DateUtils.convertToString(this.checkIn));
    this.bookingButtonState.checkOutDate.set(DateUtils.convertToString(this.checkOut));
    this.router.navigate(['/availability-result']);
  }

  protected onCheckInChange(newCheckIn: TuiDay): void {
    this.checkIn = newCheckIn;
    if (this.checkOut.daySameOrBefore(this.checkIn)) {
      this.checkOut = this.checkIn.append({ day: 1 });
    }
  }


  private calculateThreshold() {
    if (this.bookingButton) {
      const elementHeight = this.bookingButton.nativeElement.offsetHeight;
      this.threshold = (window.innerHeight / 2) - (elementHeight / 2);
    }
  }
}
