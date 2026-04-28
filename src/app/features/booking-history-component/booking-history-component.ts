import { Component, inject, signal } from '@angular/core';
import { BookingService } from '../../core/services/booking-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { BookingHistoryItemComponent } from '../booking-history-item-component/booking-history-item-component';
import { RouterModule } from '@angular/router';
import { SideMenuComponent } from "../../shared/side-menu-component/side-menu-component";
import { BookingButtonComponent } from "../../shared/booking-button-component/booking-button-component";
import { FooterComponent } from "../../shared/footer-component/footer-component";

@Component({
  selector: 'app-booking-history-component',
  imports: [BookingHistoryItemComponent, RouterModule, SideMenuComponent, BookingButtonComponent, FooterComponent],
  templateUrl: './booking-history-component.html',
  styleUrl: './booking-history-component.css',
})
export class BookingHistoryComponent {
  private bookingService = inject(BookingService);

  page = signal<number>(1);
  size = signal<number>(10);

  protected bookingHistoryResource = rxResource({
    params: () => ({ 'page': this.page(), 'size': this.size() }),
    stream: ({ params }) => this.bookingService.getBookingHistory(params),
    defaultValue: []
  });

}
