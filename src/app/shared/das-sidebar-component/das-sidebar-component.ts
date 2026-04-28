import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TuiLoader } from "@taiga-ui/core";
import { RoomTypeService } from '../../core/services/room-type-service';
import { AuthService } from '../../core/auth/auth-service';
import { formatUserRole } from '../../core/common/formatter';

@Component({
  selector: 'app-das-sidebar-component',
  imports: [TuiLoader],
  templateUrl: './das-sidebar-component.html',
  styleUrl: './das-sidebar-component.css',
})
export class DasSidebarComponent {
  protected router = inject(Router);
  protected userService = inject(UserService);
  protected roomTypeService = inject(RoomTypeService);
  protected authService = inject(AuthService);

  activeMenu: string = 'dashboard';
  isCollapsed: boolean = false;
  isUserMenuOpen: boolean = false;

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {
    this.authService.logout().subscribe();
    this.isUserMenuOpen = false;
  }


  protected userSummary = rxResource({
    params: () => ({}),
    stream: () => this.userService.getCurrentUserSummary(),
    defaultValue: { id: '', fullName: '', role: '', avatarUrl: '' }
  });

  protected totalRooms = rxResource({
    params: () => this.roomTypeService.totalRoomsRefreshTrigger(),
    stream: () => this.roomTypeService.getTotalRooms(),
    defaultValue: 0
  });

  setActive(menu: string) {
    this.activeMenu = menu;
    if (menu === 'dashboard') {
      this.router.navigate(['/dashboard/overview']);
    } else if (menu === 'room-types') {
      this.router.navigate(['/dashboard/room-types']);
    } else if (menu === 'bookings') {
      this.router.navigate(['/dashboard/booking']);
    } else if (menu === 'customers') {
      this.router.navigate(['/dashboard/customer']);
    } else if (menu === 'users') {
      this.router.navigate(['/dashboard/user'])
    } else if (menu === 'reports-revenue') {
      this.router.navigate(['/dashboard/report-revenue'])
    }
  }

  toggleCollapse() { this.isCollapsed = !this.isCollapsed; }

  protected readonly formatUserRole = formatUserRole;
}
