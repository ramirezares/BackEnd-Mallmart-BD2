import { ApiProperty } from "@nestjs/swagger";

export class JwtPayload {
  
    //TODO: Documentar para Swagger
    userEmail: string;

    sub: string;

}
