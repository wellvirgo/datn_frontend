import { Component, inject, OnInit, signal } from '@angular/core';
import { RoomTypeSummaryItemRes } from '../../core/dto/room-type';
import { RoomTypeService } from '../../core/services/room-type-service';
import { Router } from '@angular/router';
import { NotifyService } from '../../core/common/notify-service';
import { RoomTypeSummaryItemComponent } from "../room-type-summary-item-component/room-type-summary-item-component";
import { SideMenuComponent } from "../../shared/side-menu-component/side-menu-component";
import { BookingButtonComponent } from "../../shared/booking-button-component/booking-button-component";
import { FooterComponent } from "../../shared/footer-component/footer-component";

@Component({
  selector: 'app-active-rt-list-component',
  imports: [RoomTypeSummaryItemComponent, SideMenuComponent, BookingButtonComponent, FooterComponent],
  templateUrl: './active-rt-list-component.html',
  styleUrl: './active-rt-list-component.css',
})
export class ActiveRtListComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  private notifyService = inject(NotifyService);
  private router = inject(Router);

  protected items = signal<RoomTypeSummaryItemRes[]>([]);
  protected isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadRoomType();
  }

  loadRoomType(): void {
    this.isLoading.set(true);
    this.roomTypeService.getActiveRoomTypes({}).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.items.set(res.items);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
        this.notifyService.notifyError("Lỗi", "Không thể tải danh sách loại phòng");
      }
    });
  }

}
