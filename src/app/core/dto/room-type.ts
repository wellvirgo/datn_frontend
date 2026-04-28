export interface RoomTypeItemRes {
    id: number;
    name: string;
    basePrice: number;
    description: string;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
    areaSize: number;
    viewType: string;
    bedTypeId: number;
    bedTypeName: string;
    thumbnail: string | null;
}

export interface RoomTypeSummaryItemRes {
    id: number;
    name: string;
    active: boolean;
    thumbnail: string;
    description: string;
    bedTypeName: string;
    viewType: string;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
    areaSize: number;
    smokingPolicy: string;
    bathroomType: string;
    extraBedAllowed: boolean;
}

export interface AvailabilityRoomTypeRes {
    id: number;
    name: string;
    description: string;
    price: number;
    viewType: string;
    areaSize: number;
    baseAdults: number;
    baseChildren: number;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
    bedArrangement: string;
    extraBedAllowed: boolean;
    extraBedPrice: number;
    availableRoomQuantity: number;
    bedTypeName: string;
    amenities: string;
    thumbnail: string;
}

export interface SearchCriteria {
    checkIn: string;
    checkOut: string;
    nights: number;
}

export interface CancellationPolicy {
    status: string;
    displayText: string;
    rawPolicy: any[];
}

export interface CheckAvailabilityRes {
    searchCriteria: SearchCriteria;
    cancellationPolicy: CancellationPolicy;
    availableRooms: AvailabilityRoomTypeRes[];
}

export interface RoomTypeBookingInfo {
    roomTypeId: number;
    adultsPerRoom: number;
    childrenPerRoom: number;
    roomQuantity: number;
    price: number;
}

export interface PublicDetailRoomTypeRes {
    id: number;
    name?: string;
    description?: string;
    roomTypeImgs?: string;
    maxAdults?: number;
    maxChildren?: number;
    maxOccupancy?: number;
    areaSize?: number;
    bedTypeName?: string;
    bedArrangement?: string;
    viewType?: string;
    extraBedAllowed?: boolean;
    smokingPolicy?: string;
    bathroomType?: string;
    amenities?: string;
    services?: string;
}

export interface RoomTypeDetailDto {
    id: number;
    name: string;
    description: string;
    roomTypeImgs: string;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
    areaSize: number;
    bedTypeName: string;
    bedArrangement: string;
    viewType: string;
    extraBedAllowed: boolean;
    smokingPolicy: string;
    bathroomType: string;
    amenities: string;
    services: string;
    thumbnail: string;
    baseAdults: number;
    baseChildren: number;
    basePrice: number;
    bedTypeId: number;
    extraBedPrice: number | null;
    totalRooms: number;
    createdAt: string;
    updatedAt: string | null;
}

export interface AmenityItem {
    id: number;
    name: string;
    checked: boolean;
}

export interface ServiceItem {
    id: number;
    name: string;
    checked: boolean;
}