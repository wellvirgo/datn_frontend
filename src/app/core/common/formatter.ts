export function formatBookingStatus(status: string): string {
    switch (status) {
        case 'PENDING_PAYMENT':
            return 'Chờ thanh toán';
        case 'CONFIRMED':
            return 'Đã xác nhận';
        case 'CHECK_IN':
            return 'Đã check-in';
        case 'CHECK_OUT':
            return 'Đã check-out';
        case 'CANCELED':
            return 'Đã hủy';
        case 'EXPIRED':
            return 'Đã hết hạn';
        default:
            return status;
    }
}


export function formatPaymentStatus(status: string): string {
    switch (status) {
        case 'UNPAID':
            return 'Chưa thanh toán';
        case 'PAID':
            return 'Đã thanh toán';
        case 'PARTIAL':
            return 'Thanh toán một phần';
        case 'REFUNDED':
            return 'Đã hoàn tiền';
        case 'PENDING':
            return 'Chờ thanh toán';
        case 'SUCCESS':
            return 'Thanh toán thành công';
        case 'FAILED':
            return 'Thanh toán thất bại';
        default:
            return status;
    }
}

export function formatVND(value: number | null) {
    if (value == null) return '';
    return value.toLocaleString('vi-VN') + ' VND';
}

export function formatUserStatus(status: boolean): string {
    return status ? 'Đang hoạt động' : 'Đã khóa';
}

export function formatUserRole(role: string): string {
    switch (role) {
        case 'CUSTOMER':
            return 'Khách hàng';
        case 'RECEPTIONIST':
            return 'Lễ tân';
        case 'MANAGER':
            return 'Quản lý';
        case 'SYSADMIN':
            return 'Quản trị hệ thống';
        default:
            return role;
    }
}