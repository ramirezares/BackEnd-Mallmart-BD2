import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-users.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO: - Documentar para Swagger

    //getProfile
  

  @Post("/register")
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Delete('/erase/:userEmail')
  async remove(@Param('userEmail') userEmail: string) {
    return this.usersService.remove(userEmail);
  }

  // Doc para Swagger
  @Post("/login")
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }
}
