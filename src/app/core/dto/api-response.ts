export interface ApiResponse<T> {
    code: string;
    message: string;
    data?: T;
    errors?: ErrorDetail[];
}

export interface ErrorDetail {
    object: string;
    field: string;
    message: string;
}

export interface PageableResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}