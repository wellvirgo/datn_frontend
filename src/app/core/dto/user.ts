export interface UserSummaryInfo {
    id: string;
    fullName: string;
    role: string;
    avatarUrl: string;
}

export interface CustomerItemRes {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    totalBooking: number;
    totalSpent: number;
}

export interface DasUserItemRes {
    id: number;
    fullName: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
}

export interface DasUserDetailRes extends DasUserItemRes {
    avatarUrl: string
    updateAt: string
}