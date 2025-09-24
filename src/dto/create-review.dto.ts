import { IsString, IsInt, IsUUID, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  productId: string;

  @IsString()
  comment: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

