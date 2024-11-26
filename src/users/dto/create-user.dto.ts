import { IsEmail, isNotEmpty, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateUserDto {

    //TODO - Documentar para Swagger

    @IsEmail()
    @IsNotEmpty()
    readonly userEmail: string;

    @IsString()
    @IsNotEmpty()
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    readonly lastName: string;

    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message: 'La contraseña debe tener al menos 8 caracteres, incluir al menos una mayuscula y al menos un numero',
      })
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly address: string;

}

