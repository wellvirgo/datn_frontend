import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingHistoryItemResDto } from '../../core/dto/booking';

@Component({
  selector: 'app-booking-history-item-component',
  imports: [CommonModule],
  templateUrl: './booking-history-item-component.html',
  styleUrl: './booking-history-item-component.css',
})
export class BookingHistoryItemComponent {
  item = input.required<BookingHistoryItemResDto>();
  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
