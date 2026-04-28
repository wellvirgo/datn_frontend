import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiError, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiPassword } from '@taiga-ui/kit';
import { TuiForm } from '@taiga-ui/layout';
import { AuthService } from '../../core/auth/auth-service';
import { Router } from '@angular/router';
import { NotifyService } from '../../core/common/notify-service';

@Component({
  selector: 'app-signup-component',
  imports: [TuiLoader, TuiTextfield, TuiForm, TuiError, TuiButton, TuiIcon, TuiPassword, ReactiveFormsModule, TuiFieldErrorPipe, AsyncPipe],
  templateUrl: './signup-component.html',
  styleUrl: './signup-component.css',
})
export class SignupComponent {
  private fb: FormBuilder = new FormBuilder();
  private router = inject(Router);
  private authService = inject(AuthService);
  private notifyService = inject(NotifyService);


  protected isLoading = signal(false);

  protected signUpForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.required]],
  });

  protected signUp(): void {
    this.isLoading.set(true);
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.isLoading.set(false);
      this.notifyService.notifyError('Lỗi', 'Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }


    this.authService.register(this.signUpForm.value).subscribe({
      next: (status) => {
        this.isLoading.set(false);
        if (status === 201) {
          this.notifyService.notifySuccess('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập');
          this.router.navigate(['/login']);
        } else {
          this.notifyService.notifyError('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notifyService.notifyError('Lỗi', error.error?.message || 'Đăng ký thất bại. Vui lòng thử lại');
      }
    });
  }

  protected navigateLogin(): void {
    this.router.navigate(['/login']);
  }


}
