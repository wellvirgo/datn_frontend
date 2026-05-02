import { PaymentHistoryRes } from "./payment";

export interface BookingRes {
    bookingCode: string;
    paymentUrl: string;
}

export interface DetailHistoryItemResDto {
    id: number;
    roomTypeName: string;
    roomNumber: string;
    price: number;
    adults: number;
    children: number;
}

export interface BookingHistoryItemResDto {
    id: number;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    paidAmount: number;
    depositAmount: number;
    balanceDue: number;
    paymentDeadline: string;
    paymentStatus: string;
    bookingStatus: string;
    cancellationDisplayText: string;
    details: DetailHistoryItemResDto[];
    createdAt: string;
    checkInTime: string;
    checkOutTime: string;
}

export interface DasBookingItemRes {
    id: number;
    bookingCode: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    paymentStatus: string;
    bookingStatus: string;
    stayDuration: string;
    createdAt: string;
}

export interface DasBookingDetailRes extends BookingHistoryItemResDto {
    accountEmail: string;
    paymentHistory: PaymentHistoryRes[];
}
