// neo4j.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Neo4jService } from './neo4j.service';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { Logger } from '@nestjs/common';

describe('Neo4jService', () => {
    let service: Neo4jService;
    let driverMock: Partial<Driver>;
    let sessionMock: Partial<Session>;
    let verifyConnectivityMock: jest.Mock;
    let runMock: jest.Mock;
    let sessionCloseMock: jest.Mock;
    let closeMock: jest.Mock;

    beforeEach(async () => {
        // Création des mocks pour les méthodes du driver Neo4j
        verifyConnectivityMock = jest.fn().mockResolvedValue(undefined);
        runMock = jest.fn().mockResolvedValue({ records: [] });
        sessionCloseMock = jest.fn().mockResolvedValue(undefined);
        closeMock = jest.fn().mockResolvedValue(undefined);

        sessionMock = {
            run: runMock,
            close: sessionCloseMock,
        };

        driverMock = {
            verifyConnectivity: verifyConnectivityMock,
            session: jest.fn().mockReturnValue(sessionMock),
            close: closeMock,
        };

        // On espionne la méthode neo4j.driver pour renvoyer notre mock
        jest.spyOn(neo4j, 'driver').mockReturnValue(driverMock as Driver);

        const module: TestingModule = await Test.createTestingModule({
            providers: [Neo4jService],
        }).compile();

        service = module.get<Neo4jService>(Neo4jService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should verify connectivity and log success', async () => {
            const loggerLogSpy = jest.spyOn((service as any).logger, 'log');
            await service.onModuleInit();
            expect(verifyConnectivityMock).toHaveBeenCalled();
            expect(loggerLogSpy).toHaveBeenCalledWith("✅ Connected to Neo4j");
        });

        it('should log error if connectivity verification fails', async () => {
            const error = new Error('Connection failed');
            verifyConnectivityMock.mockRejectedValueOnce(error);
            const loggerErrorSpy = jest.spyOn((service as any).logger, 'error');
            await service.onModuleInit();
            expect(loggerErrorSpy).toHaveBeenCalledWith("❌ Error connecting to Neo4j", error);
        });
    });

    describe('executeQuery', () => {
        it('should execute a query and close the session', async () => {
            const query = 'MATCH (n) RETURN n';
            const params = { name: 'test' };

            const result = await service.executeQuery(query, params);

            expect(runMock).toHaveBeenCalledWith(query, params);
            expect(sessionCloseMock).toHaveBeenCalled();
            expect(result).toEqual({ records: [] });
        });
    });

    describe('onModuleDestroy', () => {
        it('should close the driver and log a message', async () => {
            const loggerLogSpy = jest.spyOn((service as any).logger, 'log');
            await service.onModuleDestroy();
            expect(closeMock).toHaveBeenCalled();
            expect(loggerLogSpy).toHaveBeenCalledWith("🛑 Neo4j driver closed.");
        });
    });

    describe('getDriver', () => {
        it('should return the driver instance', () => {
            expect(service.getDriver()).toBe(driverMock);
        });
    });
});
