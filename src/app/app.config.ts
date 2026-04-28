import { provideEventPlugins } from "@taiga-ui/event-plugins";
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { TUI_VALIDATION_ERRORS } from "@taiga-ui/kit";

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./core/auth/auth-interceptor";
import { MarkdownModule } from "ngx-markdown";

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withViewTransitions()),
        provideEventPlugins(),
        provideHttpClient(withInterceptors([authInterceptor])),
        importProvidersFrom(MarkdownModule.forRoot()),
        {
            provide: TUI_VALIDATION_ERRORS,
            useValue: {
                required: "Trường này không được để trống",
            }
        }
    ]
};
