import { IsOptional, IsNumber } from 'class-validator';

export class UpdateCartDto {
    @IsOptional()
    @IsNumber()
    totalAmount?: number;

    @IsOptional()
    @IsNumber()
    totalQuantity?: number;
}
