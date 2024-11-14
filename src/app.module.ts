import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from 'nest-neo4j';
import { Neo4jConnectionModule } from './neo4j-connection/neo4j-connection.module';
import { EnvConfiguration } from './config/env.configuration';

@Module({
  imports: [
    // Variables de envolvimiento
    ConfigModule.forRoot({ 
      load: [EnvConfiguration],
      isGlobal: true
    }),
  
    // Configuramos la base de datos Neo4j    
    Neo4jModule,

    Neo4jConnectionModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
