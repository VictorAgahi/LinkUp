import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
    let service: PrismaService;

    beforeEach(() => {
        service = new PrismaService();
        jest.spyOn(service, '$connect').mockResolvedValue(undefined);
        jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
        jest.spyOn((service as any).logger, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect to the database and log success', async () => {
            await service.onModuleInit();
            expect(service.$connect).toHaveBeenCalled();
            expect((service as any).logger.log).toHaveBeenCalledWith('✅ Connected to PostgreSQL');
        });
    });

    describe('onModuleDestroy', () => {
        it('should disconnect from the database and log the disconnection', async () => {
            await service.onModuleDestroy();
            expect(service.$disconnect).toHaveBeenCalled();
            expect((service as any).logger.log).toHaveBeenCalledWith('❌ Disconnected from PostgreSQL');
        });
    });
});
