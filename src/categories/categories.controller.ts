import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('Categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  //TODO: Doc para Swagger

  @Get('/all')
  findAll() {
    return this.categoriesService.getCatNames();
  }

  @Post('/create')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get('/:name')
  findOne(@Param('name') name: string) {
    return this.categoriesService.findOne(name);
  }

  @Delete('/erase/:name')
  remove(@Param('name') name: string) {
    return this.categoriesService.remove(name);
  }
}
