import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeSummaryItemRes } from '../../core/dto/room-type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-type-summary-item-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-type-summary-item-component.html',
  styleUrl: './room-type-summary-item-component.css',
})
export class RoomTypeSummaryItemComponent {
  item = input.required<RoomTypeSummaryItemRes>();
  private router = inject(Router);

  protected goToDetail(id: number): void {
    this.router.navigate(['/room-type', id]);
  }
}
