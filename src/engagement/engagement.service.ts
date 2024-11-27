import { ConflictException, Injectable } from '@nestjs/common';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { Session } from 'neo4j-driver';

@Injectable()
export class EngagementService {

  constructor(private readonly neo4jService: Neo4jConnectionService) { }

  findAll() {
    return `This action returns all engagement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} engagement`;
  }
}
