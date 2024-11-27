import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { EngagementDto } from '../cart/dto/engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get()
  findAll() {
    return this.engagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.engagementService.findOne(+id);
  }

}
