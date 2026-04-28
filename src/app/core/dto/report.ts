export interface OverviewRes {
    bookedTodayCount: number;
    totalRoomsToday: number;
    diffBookedVsYesterday: number;
    totalCheckIn: number;
    pendingCheckIn: number;
    todayRevenue: number;
    diffRevenueVsLastWeekPercentage: number;
    roomOccupancyPercentage: number;
    occupancyStatusLabel: string;
    occupancyStatusColor: string;
}

export function initOverviewRes(): OverviewRes {
    return {
        bookedTodayCount: 0,
        totalRoomsToday: 0,
        diffBookedVsYesterday: 0,
        totalCheckIn: 0,
        pendingCheckIn: 0,
        todayRevenue: 0,
        diffRevenueVsLastWeekPercentage: 0,
        roomOccupancyPercentage: 0,
        occupancyStatusLabel: '',
        occupancyStatusColor: ''
    };
}

export interface FinancialKpiDto {
    totalRevenue: number;
    averageDailyRate: number;
    revenuePerAvailableRoom: number;
    totalDebt: number;
}

export interface DailyRevenueTrendDto {
    reportDate: string;
    revenue: number;
}