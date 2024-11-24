import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";
export class CreateCategoryDto {

    //TODO - Doc para Swagger

    @IsNotEmpty()
    @IsString()
    readonly name: string;
}
