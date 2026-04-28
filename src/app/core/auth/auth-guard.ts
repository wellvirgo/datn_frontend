import { inject } from "@angular/core";
import { Router, CanActivateFn, RedirectCommand } from "@angular/router";
import { AuthService } from "./auth-service";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        const homeUrl = router.parseUrl('/home');
        return new RedirectCommand(homeUrl, {
            skipLocationChange: true,
        });
    }

    return true;
}

export const dashGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    let isAllowed = authService.isAdmin() || authService.isManager() || authService.isReceptionist();

    if (!isAllowed) {
        const homeUrl = router.parseUrl('/home');
        return new RedirectCommand(homeUrl);
    }

    return true;
}