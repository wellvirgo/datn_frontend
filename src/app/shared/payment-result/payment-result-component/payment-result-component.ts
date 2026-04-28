import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-result-component',
  imports: [],
  templateUrl: './payment-result-component.html',
  styleUrl: './payment-result-component.css',
})
export class PaymentResultComponent implements OnInit {
  protected isSuccess = signal<boolean>(false);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.isSuccess.set(params.get('status') === 'success');
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToBookingHistory() {
    this.router.navigate(['/booking-history']);
  }

}
