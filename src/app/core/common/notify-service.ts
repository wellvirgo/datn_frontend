import { inject, Injectable } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private alertService = inject(TuiAlertService);

  public notifySuccess(title: string, message: string, duration: number = 3000): void {
    this.alertService.open(`<span class='success-message'>${message}</span>`, { label: title, appearance: 'positive', autoClose: duration }).subscribe();
  }

  public notifyError(title: string, message: string, duration: number = 3000): void {
    this.alertService.open(`<span class='error-message'>${message}</span>`, { label: title, appearance: 'negative', autoClose: duration }).subscribe();
  }
}
