import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import neo4j, { Driver } from "neo4j-driver";
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
    private readonly driver: Driver;
    private readonly logger = new Logger(Neo4jService.name);

    constructor() {
        const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
        const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
        const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";

        this.driver = neo4j.driver(
            NEO4J_URI,
            neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
        );
    }

    async onModuleInit() {
        try {
            await this.driver.verifyConnectivity();
            this.logger.log("✅ Connected to Neo4j");
        } catch (error) {
            this.logger.error("❌ Error connecting to Neo4j", error);
        }
    }

    async executeQuery(query: string, params: Record<string, any> = {}) {
        const session = this.driver.session();
        try {
            return await session.run(query, params);
        } finally {
            await session.close();
        }
    }

    async onModuleDestroy() {
        await this.driver.close();
        this.logger.log("🛑 Neo4j driver closed.");
    }

    getDriver(): Driver {
        return this.driver;
    }
}