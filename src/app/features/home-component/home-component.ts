import { Component, inject, OnInit, signal } from '@angular/core';
import { RoomTypeService } from '../../core/services/room-type-service';
import { RoomTypeSummaryItemRes } from '../../core/dto/room-type';
import { TuiLoader, TuiButton } from "@taiga-ui/core";
import { FooterComponent } from "../../shared/footer-component/footer-component";
import { SideMenuComponent } from "../../shared/side-menu-component/side-menu-component";
import { BookingButtonComponent } from "../../shared/booking-button-component/booking-button-component";
import { Router } from '@angular/router';
import { ChatBoxComponent } from "../../shared/chat-box-component/chat-box-component";

@Component({
  selector: 'app-home-component',
  imports: [TuiLoader, TuiButton, FooterComponent, SideMenuComponent, BookingButtonComponent, ChatBoxComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  private router = inject(Router);

  protected isLoading = signal(false);
  protected roomTypes = signal<RoomTypeSummaryItemRes[]>([]);

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  private loadRoomTypes(): void {
    this.isLoading.set(true);
    this.roomTypeService.getActiveRoomTypes({}).subscribe(
      {
        next: (data) => {
          this.roomTypes.set(data.items);
        },
        complete: () => { this.isLoading.set(false); }
      }
    );
  }

  protected goToDetail(id: number): void {
    this.router.navigate(['/room-type', id]);
  }
}
