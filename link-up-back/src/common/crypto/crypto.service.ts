import { Injectable } from '@nestjs/common';
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash
} from 'crypto';

export type EncryptedData = {
    iv: string;
    authTag: string;
    cipherText: string;
};

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;

    constructor() {
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY is missing in environment variables');
        }
        this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

        if (this.key.length !== 32) {
            throw new Error('Invalid encryption key length (must be 256-bit/32 bytes)');
        }
    }

    deterministicEncrypt(data: string): string {
        const iv = createHash('sha256')
            .update(data)
            .digest()
            .subarray(0, 16);

        const cipher = createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        return this.serializeEncryptedData({
            iv: iv.toString('hex'),
            authTag,
            cipherText: encrypted
        });
    }

    async encrypt(data: string): Promise<string> {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        return this.serializeEncryptedData({
            iv: iv.toString('hex'),
            authTag,
            cipherText: encrypted
        });
    }

    decrypt(encryptedString: string): string {
        const { iv, authTag, cipherText } = this.parseEncryptedData(encryptedString);

        const decipher = createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(cipherText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    private serializeEncryptedData(data: EncryptedData): string {
        return `${data.iv}:${data.authTag}:${data.cipherText}`;
    }

    private parseEncryptedData(encryptedString: string): EncryptedData {
        const [iv, authTag, cipherText] = encryptedString.split(':');

        if (!iv || !authTag || !cipherText) {
            throw new Error('Invalid encrypted data format');
        }

        return { iv, authTag, cipherText };
    }
}