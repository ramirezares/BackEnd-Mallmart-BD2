import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //TODO: Doc para Swagger

  @Get('/:userEmail')
  findOne(@Param('userEmail') userEmail: string) {
    return this.cartService.getProductsOfCart(userEmail);
  }

  //TODO: Comprar: Al comprar debe guardar la categoria en engagement
  @Post('/purchase/:userEmail')
  purchase(@Param('userEmail') userEmail: string){
    return this.cartService.buyProducts(userEmail);
  }
}
