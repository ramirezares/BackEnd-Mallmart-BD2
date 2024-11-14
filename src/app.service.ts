import { Injectable } from '@nestjs/common';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';

@Injectable()
export class AppService {

  constructor(private readonly neo4jConnectionService: Neo4jConnectionService) {}

  async getNodeCount(): Promise<number> {
    const session = await this.neo4jConnectionService.getSession();
    try {
      const result = await session.run('MATCH (n) RETURN count(n) AS count');
      const count = result.records[0].get('count').toNumber(); // Obtener el conteo del primer registro
      return count;
    } finally {
      await session.close(); // Asegúrate de cerrar la sesión
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

}
