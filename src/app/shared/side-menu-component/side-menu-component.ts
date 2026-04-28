import { AfterViewInit, Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { AuthService } from '../../core/auth/auth-service';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-side-menu-component',
  imports: [RouterLink],
  templateUrl: './side-menu-component.html',
  styleUrl: './side-menu-component.css',
})
export class SideMenuComponent implements AfterViewInit {

  protected authService = inject(AuthService);
  private router = inject(Router);

  ngAfterViewInit(): void {
    this.calculateThreshold();
  }

  @ViewChild('menuContainer') menuContainer!: ElementRef;

  protected isSticky = signal(false);
  protected isMenuOpen = signal(false);
  private threshold = 0;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isSticky.set(window.scrollY > this.threshold);
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update(toggle => !toggle);
  }

  protected logout(): void {
    this.authService.logout().subscribe();
  }

  private calculateThreshold() {
    if (this.menuContainer) {
      const elementHeight = this.menuContainer.nativeElement.offsetHeight;
      this.threshold = (window.innerHeight / 2) - (elementHeight / 2);
    }
  }

}
