import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class EngagementDto {

    //TODO - Documentar para Swagger
    // ApiProperty

    @IsEmail()
    @IsNotEmpty()
    readonly userEmail: string;

    @IsString()
    @IsNotEmpty()
    readonly date: Date
}
