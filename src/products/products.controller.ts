import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { get } from 'http';
import { AddToCartDto } from './dto/addToCart-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //TODO - Documentar para Swagger

  @Get('/count')
  async getCount() {
    return this.productsService.count();
  }

  @Get('/all')
  async findAll() {
    return this.productsService.findAll();
  }

  @Post('/create')
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('/top/five')
  async getTopFive() {
    return this.productsService.getTopFive();
  }

  @Get("/categoryID/:categoryID")
  async getByCategory(@Param('categoryID') categoryID: string){
    return this.productsService.findByCategoryID(categoryID);
  }

  @Post('/addToCart')
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.productsService.addToCart(addToCartDto);
  }

  @Delete('/erase/:id')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  //Recomendaciones
  @Get('/recommendations/:userEmail')
  async getRecommendations(@Param('userEmail') userEmail: string){
    return this.productsService.getRecommendations(userEmail);
  }
}
