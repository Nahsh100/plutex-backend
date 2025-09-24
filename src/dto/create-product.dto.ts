import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';

export enum ProductAvailability {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  DISCONTINUED = 'DISCONTINUED',
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsString()
  brand: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  specifications?: Record<string, any>;

  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;

  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsString()
  vendorId: string;

  @IsString()
  categoryId: string;
}
