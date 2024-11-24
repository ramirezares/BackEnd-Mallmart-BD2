import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Neo4jConnectionModule } from 'src/neo4j-connection/neo4j-connection.module';

@Module({
  imports: [Neo4jConnectionModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
