import { IsEmail, IsString, Matches } from "class-validator";

export class CreateUserDto {

    //TODO - Documentar para Swagger

    @IsEmail()
    readonly userEmail: string;

    @IsString()
    readonly firstName: string;

    @IsString()
    readonly lastName: string;

    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message: 'La contraseña debe tener al menos 8 caracteres, incluir al menos una mayuscula y al menos un numero',
      })
    readonly password: string;

    @IsString()
    readonly address: string;

}
