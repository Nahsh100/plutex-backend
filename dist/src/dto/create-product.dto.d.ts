export declare enum ProductAvailability {
    IN_STOCK = "IN_STOCK",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    LOW_STOCK = "LOW_STOCK",
    DISCONTINUED = "DISCONTINUED"
}
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    brand: string;
    images: string[];
    specifications?: Record<string, any>;
    availability?: ProductAvailability;
    stockQuantity?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sku?: string;
    weight?: number;
    dimensions?: string;
    vendorId: string;
    categoryId: string;
}
