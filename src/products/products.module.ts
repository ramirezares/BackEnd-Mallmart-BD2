import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Neo4jConnectionModule } from 'src/neo4j-connection/neo4j-connection.module';

@Module({
  imports: [Neo4jConnectionModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
