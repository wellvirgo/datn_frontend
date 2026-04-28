import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./features/login-component/login-component').then(m => m.LoginComponent) },
    { path: 'signup', loadComponent: () => import('./features/signup-component/signup-component').then(m => m.SignupComponent) },
    { path: 'home', loadComponent: () => import('./features/home-component/home-component').then(m => m.HomeComponent) },
    { path: 'availability-result', loadComponent: () => import('./features/availability-room-result-component/availability-room-result-component').then(m => m.AvailabilityRoomResultComponent) },
    { path: 'payment-result', loadComponent: () => import('./shared/payment-result/payment-result-component/payment-result-component').then(m => m.PaymentResultComponent) },
    { path: 'room-types', loadComponent: () => import('./features/active-rt-list-component/active-rt-list-component').then(m => m.ActiveRtListComponent) },
    { path: 'room-type/:id', loadComponent: () => import('./features/pub-detail-room-type-component/pub-detail-room-type-component').then(m => m.PubDetailRoomTypeComponent) },
    { path: 'booking-history', loadComponent: () => import('./features/booking-history-component/booking-history-component').then(m => m.BookingHistoryComponent) },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard-component/dashboard-component').then(m => m.DashboardComponent),
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', loadComponent: () => import('./features/das-overview-component/das-overview-component').then(m => m.DasOverviewComponent) },
            { path: 'room-types', loadComponent: () => import('./features/das-room-type-component/das-room-type-component').then(m => m.DasRoomTypeComponent) },
            { path: 'booking', loadComponent: () => import('./features/das-booking-component/das-booking-component').then(m => m.DasBookingComponent) },
            { path: 'customer', loadComponent: () => import('./features/das-customer/das-customer').then(m => m.DasCustomer) },
            { path: 'user', loadComponent: () => import('./features/das-user-component/das-user-component').then(m => m.DasUserComponent) },
            { path: 'report-revenue', loadComponent: () => import('./features/report-revenue-component/report-revenue-component').then(m => m.ReportRevenueComponent) }
        ]
    },
];
