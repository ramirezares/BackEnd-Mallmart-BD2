import { IsEmail, IsNotEmpty } from "class-validator";
export class CreateCartDto {

    //TODO: Documentar para Swagger
    @IsNotEmpty()
    @IsEmail()
    userEmail: string;

    totalAmount = 0;

    totalQuantity = 0;
}
