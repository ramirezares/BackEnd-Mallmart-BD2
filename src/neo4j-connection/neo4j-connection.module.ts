import { Module } from '@nestjs/common';
import { Neo4jConnectionService } from './neo4j-connection.service';

@Module({
  providers: [Neo4jConnectionService],
  exports: [Neo4jConnectionService]
})
export class Neo4jConnectionModule {
  
}
