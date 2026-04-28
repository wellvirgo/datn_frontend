import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiError, TuiLoader, tuiLoaderOptionsProvider, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiPassword } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { TuiForm } from "@taiga-ui/layout";
import { TuiIcon, TuiButton } from '@taiga-ui/core';
import { NotifyService } from '../../core/common/notify-service';
import { AuthService } from '../../core/auth/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, TuiTextfield, TuiForm, TuiPassword, TuiIcon, TuiButton, TuiError, TuiLoader, TuiFieldErrorPipe, AsyncPipe],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
  providers: [
    tuiLoaderOptionsProvider({
      size: 'xl',
      overlay: true,
    })
  ]
})
export class LoginComponent {

  private fb: FormBuilder = new FormBuilder();
  private router = inject(Router);

  private notifyService: NotifyService = inject(NotifyService);
  protected authService = inject(AuthService);

  protected isLoading = signal(false);

  protected loginForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected login(): void {
    this.isLoading.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.isLoading.set(false);
      this.notifyService.notifyError('Đăng nhập thất bại', 'Vui lòng điền vào tất cả các trường bắt buộc.');
    }

    const email = this.loginForm.value.email ?? '';
    const password = this.loginForm.value.password ?? '';

    this.authService.login(email, password)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.notifyService.notifySuccess('Đăng nhập thành công', 'Chào mừng quay trở lại.');
          if (this.authService.isAdmin() || this.authService.isManager() || this.authService.isReceptionist()) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          let message = err.error?.code === '09' ? 'Tài khoản hoặc mật khẩu không đúng.' : err.error?.message;
          this.notifyService.notifyError('Đăng nhập thất bại', message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      });
  }

  protected navigateSignup(): void {
    this.router.navigate(['/signup']);
  }

}
