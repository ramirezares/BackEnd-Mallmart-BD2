import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';

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

  @Delete('/erase/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('/top/five')
  async getTopFive() {
    return this.productsService.getTopFive();
  }
}
