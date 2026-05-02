export class StringifyUtils {
    public static bookingStatusDisplayText(status: string): string {
        switch (status) {
            case 'PENDING_PAYMENT':
                return 'Đang chờ thanh toán';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'CHECK_IN':
                return 'Đã nhận phòng';
            case 'CHECK_OUT':
                return 'Đã trả phòng';
            case 'CANCELED':
                return 'Đã hủy';
            case 'EXPIRED':
                return 'Đã hết hạn';
            default:
                return status;
        };
    };

    public static bookingPaymentStatusDisplayText(status: string): string {
        switch (status) {
            case 'UNPAID':
                return 'Chưa thanh toán';
            case 'PARTIAL':
                return 'Thanh toán một phần';
            case 'PAID':
                return 'Đã thanh toán';
            case 'REFUNDED':
                return 'Đã hoàn tiền';
            default:
                return status;
        };
    };
}