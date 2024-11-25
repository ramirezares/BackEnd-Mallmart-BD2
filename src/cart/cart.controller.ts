import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //TODO: Doc para Swagger

  @Post('/create')
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }

  @Get('/:userEmail')
  findOne(@Param('userEmail') userEmail: string) {
    return this.cartService.findOne(userEmail);
  }

  @Patch('/update/:userEmail') 
  update(@Param('userEmail') userEmail: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(userEmail, updateCartDto);
  }
}
