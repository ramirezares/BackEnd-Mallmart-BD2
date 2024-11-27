import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO: - Documentar para Swagger

  @UseGuards(AuthGuard('jwt'))
  @Get("/profile")
  getUserProfile(@Request() req) {
    return req.user;
  }
  
  @Post("/register")
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }
  // Doc para Swagger
  @Post("/login")
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @Delete('/erase/:userEmail')
  async remove(@Param('userEmail') userEmail: string) {
    return this.usersService.remove(userEmail);
  }

}
