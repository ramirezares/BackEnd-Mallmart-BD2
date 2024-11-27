import { Module } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';
import { Neo4jConnectionModule } from 'src/neo4j-connection/neo4j-connection.module';

@Module({
  imports: [Neo4jConnectionModule],
  controllers: [EngagementController],
  providers: [EngagementService],
})
export class EngagementModule {}
