import { HttpClient, HttpContext, HttpContextToken, HttpResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ApiResponse } from '../dto/api-response';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

export const IS_PUBLIC_API = new HttpContextToken<boolean>(() => false);


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private static readonly API_URL = 'http://localhost:8080/api/v1/auth';
  static readonly TOKEN_KEY = 'auth_token';

  private roleSignal = signal<string | null>(null);

  public readonly currentRole = computed(() => this.roleSignal());
  public readonly isAdmin = computed(() => this.roleSignal() === 'SYSADMIN');
  public readonly isManager = computed(() => this.roleSignal() === 'MANAGER');
  public readonly isReceptionist = computed(() => this.roleSignal() === 'RECEPTIONIST');
  public readonly isCustomer = computed(() => this.roleSignal() === 'CUSTOMER');
  public readonly isAuthenticated = computed(() => this.roleSignal() !== null);
  public email = signal<string | null>(null);
  public avatarUrl = signal<string | null>(null);


  private httpClient: HttpClient = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.loadTokenFromStorage();
    effect(() => {
      if (this.isAuthenticated()) {
        this.loadTokenFromStorage();
      }
    })
  }


  private loadTokenFromStorage(): void {
    const token = localStorage.getItem(AuthService.TOKEN_KEY);
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.roleSignal.set(decodedToken.scope);
      this.email.set(decodedToken.sub);
    }
  }


  public register(payload: any): Observable<any> {
    return this.httpClient.post<ApiResponse<void>>(`${AuthService.API_URL}/register`, payload, {
      observe: 'response',
      context: new HttpContext().set(IS_PUBLIC_API, true),
    }).pipe(
      map(response => response.status)
    );
  }


  public login(email: string, password: string): Observable<HttpResponse<ApiResponse<string>>> {
    return this.httpClient.post<ApiResponse<string>>(`${AuthService.API_URL}`,
      {
        "email": email,
        "password": password
      },
      {
        observe: 'response',
        context: new HttpContext().set(IS_PUBLIC_API, true),
        withCredentials: true
      }).pipe(
        tap(response => {
          if (response.status === 200 && response.body?.data) {
            const token = response.body.data;
            localStorage.setItem(AuthService.TOKEN_KEY, token);
            const decodedToken: any = jwtDecode(token);
            this.roleSignal.set(decodedToken.scope)
          }
        })
      );
  }

  public refreshToken(): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(`${AuthService.API_URL}/refresh`, {}, {
      withCredentials: true,
      context: new HttpContext().set(IS_PUBLIC_API, true),
    }).pipe(
      tap(response => {
        if (response.code === '200' && response.data) {
          const token = response.data;
          localStorage.setItem(AuthService.TOKEN_KEY, token);
          const decodedToken: any = jwtDecode(token);
          this.roleSignal.set(decodedToken.scope)
        }
      }),
      catchError(error => {
        this.logout(false).subscribe();
        return throwError(() => error);
      })
    );
  }

  public logout(isCallApi: boolean = true): Observable<any> {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    this.roleSignal.set(null);
    this.router.navigate(['/login']);

    if (!isCallApi) {
      return of(null);
    }

    return this.httpClient.post<any>(`${AuthService.API_URL}/logout`, {}, {
      withCredentials: true,
    });
  }
}
