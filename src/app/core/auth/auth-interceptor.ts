import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { AuthService, IS_PUBLIC_API } from "./auth-service";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from "rxjs";
import { inject } from "@angular/core";

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const authService = inject(AuthService);
    const token: string = localStorage.getItem(AuthService.TOKEN_KEY) ?? '';

    if (req.context.get(IS_PUBLIC_API)) {
        return next(req);
    }

    const newReq = addHeader(req, token);

    return next(newReq).pipe(
        catchError(error => {
            if (error.status === 401 && error instanceof HttpErrorResponse) {
                return handle401Error(req, next, authService);
            }
            return throwError(() => error);
        })
    );

}

function addHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone(
        { headers: req.headers.set('Authorization', `Bearer ${token}`) }
    );
}

function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
            switchMap(response => {
                isRefreshing = false;
                const newToken = response.data;
                if (response.code === '200' && newToken) {
                    refreshTokenSubject.next(newToken);
                    return next(addHeader(req, newToken));
                }
                return throwError(() => new Error('Failed to refresh token'));
            }),
            catchError(error => {
                isRefreshing = false;
                return throwError(() => error);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => next(addHeader(req, token!)))
        )
    }
}