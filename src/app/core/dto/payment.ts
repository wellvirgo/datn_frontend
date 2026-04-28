export interface PaymentHistoryRes {
    transactionNo: string;
    amount: number;
    paidAt: string;
    paymentMethod: string;
    status: string;
}