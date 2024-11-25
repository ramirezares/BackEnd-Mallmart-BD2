import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Neo4jConnectionModule } from 'src/neo4j-connection/neo4j-connection.module';

@Module({
  imports: [Neo4jConnectionModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
