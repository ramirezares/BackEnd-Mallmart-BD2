import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { EngagementDto } from './dto/engagement.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //TODO: Doc para Swagger

  @Get('/:userEmail')
  findOne(@Param('userEmail') userEmail: string) {
    return this.cartService.getProductsOfCart(userEmail);
  }

  @Post('/purchase')
  purchase(@Body() engagementDto: EngagementDto ){
    return this.cartService.purchaseProducts(engagementDto);
  }
}
