import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Neo4jConnectionService implements OnModuleInit, OnModuleDestroy {
    private driver: Driver;
    private isDriverReady: boolean = false;
    private driverInitializatedPromise: Promise<void>;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        const uri = this.configService.get<string>('neo4j.uri');
        const user = this.configService.get<string>('neo4j.username');
        const password = this.configService.get<string>('neo4j.password');
        this.driverInitializatedPromise = this.initializeDriver(uri, user, password);
    }

    private async initializeDriver(uri: string, user: string, password: string) {
        try {
            // Creo el driver usando la funcion del driver oficial de Neo4j
            this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
            
            //Configuro la session
            const session = this.driver.session();
            await session.run("RETURN 1 as result");
            await session.close();

            this.isDriverReady = true;
        } catch (error) {
            console.error('Error al inicializar el driver de Neo4j:', error);
        }
    }

    async onModuleDestroy() {
        await this.driver?.close();
    }

    async getSession(database?: string): Promise<Session> {
        
        // Espera la promesa de la peticion al driver
        await this.driverInitializatedPromise;

        // Verifico
        if (!this.isDriverReady) {
            throw new Error('El driver de Neo4j no esta listo');
        }

        return this.driver.session({ database });
    }
}


