import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    const nodeCount = await this.appService.getNodeCount();
    return `Hello World! Hay ${nodeCount} nodos en la base de datos. Prueba exitosa`;
  }
  /*
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  */
}
