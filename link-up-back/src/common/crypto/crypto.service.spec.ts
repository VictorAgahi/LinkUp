import { CryptoService, EncryptedData } from './crypto.service';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

describe('CryptoService', () => {
    const validHexKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'.slice(0, 64);
    const originalEnv = process.env;
    let service: CryptoService;

    beforeEach(() => {
        process.env = { ...originalEnv, ENCRYPTION_KEY: validHexKey };

    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should instantiate CryptoService with a valid key', () => {
        expect(() => new CryptoService()).not.toThrow();
    });

    it('should throw an error if ENCRYPTION_KEY is missing', () => {
        process.env = { ...originalEnv, ENCRYPTION_KEY: undefined };
        expect(() => new CryptoService()).toThrowError('ENCRYPTION_KEY is missing in environment variables');
    });

    it('should throw an error if the encryption key length is invalid', () => {
        process.env = { ...originalEnv, ENCRYPTION_KEY: 'deadbeef' };
        expect(() => new CryptoService()).toThrowError('Invalid encryption key length (must be 256-bit/32 bytes)');
    });

    describe('deterministicEncrypt', () => {
        let service: CryptoService;

        beforeEach(() => {
            service = new CryptoService();
        });

        it('should deterministically encrypt data', () => {
            const data = 'sensitiveData';
            const encrypted1 = service.deterministicEncrypt(data);
            const encrypted2 = service.deterministicEncrypt(data);
            expect(encrypted1).toBe(encrypted2);

            const parts = encrypted1.split(':');
            expect(parts.length).toBe(3);
        });

        it('should produce different outputs for different inputs', () => {
            const data1 = 'dataOne';
            const data2 = 'dataTwo';
            const encrypted1 = service.deterministicEncrypt(data1);
            const encrypted2 = service.deterministicEncrypt(data2);
            expect(encrypted1).not.toBe(encrypted2);
        });
    });

    describe('encrypt and decrypt', () => {
        let service: CryptoService;

        beforeEach(() => {
            service = new CryptoService();
        });

        it('should encrypt data and then decrypt it to the original value', async () => {
            const data = 'mySecretMessage';
            const encrypted = await service.encrypt(data);
            expect(encrypted).toMatch(/^[0-9a-fA-F]+:[0-9a-fA-F]+:[0-9a-fA-F]+$/);

            const decrypted = service.decrypt(encrypted);
            expect(decrypted).toBe(data);
        });

        it('should throw an error when decrypting an empty string', () => {
            expect(() => service.decrypt('')).toThrowError(/Invalid encrypted data/);
        });

        it('should throw an error when decrypting data with invalid format', () => {
            const invalidEncrypted = 'iv:authTag';
            expect(() => service.decrypt(invalidEncrypted)).toThrowError(/Invalid encrypted data format/);
        });

        it('should throw an error when decryption fails due to tampered data', async () => {
            const data = 'anotherSecret';
            const encrypted = await service.encrypt(data);
            const parts = encrypted.split(':');
            const tamperedEncrypted = `${parts[0]}:${parts[1]}:deadbeef`;
            expect(() => service.decrypt(tamperedEncrypted)).toThrowError(/Decryption failed/);
        });
    });

    describe('serializeEncryptedData & parseEncryptedData (private methods)', () => {
        let service: CryptoService;
        const sampleData: EncryptedData = {
            iv: 'ivsample',
            authTag: 'authtag',
            cipherText: 'ciphertext'
        };

        beforeEach(() => {
            service = new CryptoService();
        });

        it('should correctly serialize and parse encrypted data', () => {
            const serialized = (service as any).serializeEncryptedData(sampleData);
            expect(serialized).toBe('ivsample:authtag:ciphertext');

            const parsed = (service as any).parseEncryptedData(serialized);
            expect(parsed).toEqual(sampleData);
        });

        it('should throw an error if parseEncryptedData receives invalid format', () => {
            expect(() => (service as any).parseEncryptedData('invalid-format')).toThrowError('Invalid encrypted data format');
        });
    });
});
