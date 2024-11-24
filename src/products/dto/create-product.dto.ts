import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {

    // Colocare a todas las variables
    // el decorador api property

    @ApiProperty(
        {
            description: 'Nombre del producto',
            type: String,
            example: 'Producto 1'
        }
    )
    @IsString()
    readonly name: string;

    @ApiProperty(
        {
            description: 'Descripcion del producto',
            type: String,
            example: 'Descripcion del producto'
        }
    )
    @IsString()
    @IsOptional()
    readonly description: string;

    @ApiProperty(
        {
            description: 'Precio del producto',
            type: Number,
            example: 100.0
        }
    )
    @IsNumber()
    readonly price: number;

    @ApiProperty(
        {
            description: 'ID de la categoria',
            type: String,
            example: '1'
        }
    )
    @IsString()
    readonly categoryID: string;

    @ApiProperty(
        {
            description: 'Calificaciones del producto',
            type: Number,
            example: 4
        }
    )
    @IsNumber()
    readonly rating: number;

    @ApiProperty(
        {
            description: 'Imagen del producto',
            type: String,
            example: 'https://www.imagen-producto-1.com'
        }
    )
    @IsString()
    readonly image: string;




}
