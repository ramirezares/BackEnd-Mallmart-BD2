import { Injectable, UnauthorizedException} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "./users.service";
import { JwtPayload } from "./interface/jwt-payload.interface";
import { ConfigService } from "@nestjs/config";
    
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.verifyByUserEmail(payload.userEmail);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}