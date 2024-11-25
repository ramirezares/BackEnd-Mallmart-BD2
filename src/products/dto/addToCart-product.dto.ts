import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsInt } from "class-validator";
import { Integer } from "neo4j-driver";

export class AddToCartDto {

    //TODO - Documentar para Swagger
    //@ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    readonly userEmail: string;

    @IsString()
    @IsNotEmpty()
    readonly productId: string

    @IsString()
    @IsNotEmpty()
    readonly dateAdded: Date

    @IsInt()
    @IsNotEmpty()
    readonly quantity: number = 1
}
