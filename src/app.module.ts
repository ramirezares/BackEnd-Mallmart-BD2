import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from 'nest-neo4j';
import { Neo4jConnectionModule } from './neo4j-connection/neo4j-connection.module';
import { EnvConfiguration } from './config/env.configuration';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { EngagementModule } from './engagement/engagement.module';

@Module({
  imports: [
    // Variables de envolvimiento
    ConfigModule.forRoot({ 
      load: [EnvConfiguration],
      isGlobal: true
    }),
    Neo4jModule,
    Neo4jConnectionModule,
    // Modulos de cada parte de la app
    ProductsModule,
    CategoriesModule,
    UsersModule,
    CartModule,
    EngagementModule,
    
    
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
