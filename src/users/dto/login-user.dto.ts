import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import {ApiProperty} from "@nestjs/swagger/dist/decorators/api-property.decorator";

export class LoginUserDto {

    //TODO - Documentar para Swagger

    @IsEmail()
    readonly userEmail: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;

}