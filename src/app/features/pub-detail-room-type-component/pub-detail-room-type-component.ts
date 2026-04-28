import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomTypeService } from '../../core/services/room-type-service';
import { ActivatedRoute } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { PublicDetailRoomTypeRes } from '../../core/dto/room-type';
import { SideMenuComponent } from "../../shared/side-menu-component/side-menu-component";
import { BookingButtonComponent } from "../../shared/booking-button-component/booking-button-component";
import { FooterComponent } from "../../shared/footer-component/footer-component";

@Component({
  selector: 'app-pub-detail-room-type-component',
  standalone: true,
  imports: [CommonModule, SideMenuComponent, BookingButtonComponent, FooterComponent],
  templateUrl: './pub-detail-room-type-component.html',
  styleUrl: './pub-detail-room-type-component.css',
})
export class PubDetailRoomTypeComponent implements OnInit {
  protected roomTypeService = inject(RoomTypeService);
  private route = inject(ActivatedRoute);

  protected roomType = signal<PublicDetailRoomTypeRes | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap((id) => {
        if (id) {
          return this.roomTypeService.getPublicDetailRoomType(Number(id));
        }
        return of(null);
      })
    ).subscribe((data) => {
      this.roomType.set(data);
    });
  }


  images = computed(() => {
    const data = this.roomType();
    if (data && data.roomTypeImgs) {
      return data.roomTypeImgs.split(',').map(img => img.trim()).filter(img => img !== '');
    }
    return [];
  });

  amenitiesList = computed(() => {
    const data = this.roomType();
    if (data && data.amenities) {
      return data.amenities.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    return [];
  });

  servicesList = computed(() => {
    const data = this.roomType();
    if (data && data.services) {
      return data.services.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    return [];
  });

  currentImageIndex = 0;

  nextImage() {
    const imgs = this.images();
    if (imgs.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % imgs.length;
    }
  }

  prevImage() {
    const imgs = this.images();
    if (imgs.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + imgs.length) % imgs.length;
    }
  }

  setCurrentImage(index: number) {
    this.currentImageIndex = index;
  }
}
