import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  DecryptRequest,
  DecryptResponse,
  DeterministicEncryptRequest,
  DeterministicEncryptResponse,
  EncryptRequest,
  EncryptResponse,
  HashRequest,
  HashResponse,
  VerifyRequest,
  VerifyResponse,
} from '@app/common';

class CryptoError extends Error {
  constructor(
    public readonly operation: string,
    public readonly algorithm: string,
    public readonly cause: Error | string,
    public readonly code: string
  ) {
    super(`${operation} error (${algorithm}): ${cause}`);
    this.name = 'CryptoError';
    Object.setPrototypeOf(this, CryptoError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      operation: this.operation,
      algorithm: this.algorithm,
      message: this.message,
      stack: this.stack
    };
  }
}

@Injectable()
export class CryptoServices {
  private readonly logger = new Logger(CryptoServices.name);
  private readonly encryptionKey: Buffer;
  private readonly deterministicKey: Buffer;

  constructor(private configService: ConfigService) {
    try {
      this.logger.debug('Initializing encryption keys...');
      this.encryptionKey = Buffer.from(
        configService.getOrThrow<string>('ENCRYPTION_KEY'),
        'base64'
      );
      this.deterministicKey = Buffer.from(
        configService.getOrThrow<string>('DETERMINISTIC_KEY'),
        'base64'
      );
      
      this.validateKeyLength(this.encryptionKey, 32, 'ENCRYPTION_KEY');
      this.validateKeyLength(this.deterministicKey, 32, 'DETERMINISTIC_KEY');
      this.logger.debug('Encryption keys initialized successfully.');
    } catch (error) {
      this.logger.error('Key initialization failed', error);
      throw error;
    }
  }

  private validateKeyLength(key: Buffer, expectedLength: number, keyName: string): void {
    if (key.length !== expectedLength) {
      throw new CryptoError(
        'Key validation',
        'AES-256',
        `${keyName} must be ${expectedLength} bytes (received ${key.length} bytes)`,
        'INVALID_KEY_LENGTH'
      );
    }
  }

  encrypt(request: EncryptRequest): EncryptResponse {
    const algorithm = 'AES-256-CBC';
    this.logger.debug(`Starting encryption for data: ${request.plaintext}`);
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, this.encryptionKey, iv);
      
      let encrypted: Buffer;
      try {
        encrypted = Buffer.concat([
          cipher.update(request.plaintext, 'utf8'),
          cipher.final()
        ]);
      } catch (encryptionError) {
        throw new CryptoError(
          'Data processing',
          algorithm,
          encryptionError,
          'ENCRYPTION_PROCESSING_FAILURE'
        );
      }
      
      const combined = Buffer.concat([iv, encrypted]);
      this.logger.debug('Encryption completed successfully.');
      return { ciphertext: combined.toString('base64') };
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new CryptoError(
        'Encryption',
        algorithm,
        error,
        'ENCRYPTION_FAILURE'
      );
    }
  }

  decrypt(request: DecryptRequest): DecryptResponse {
    const algorithm = 'AES-256-CBC';
    this.logger.debug(`Starting decryption for ciphertext: ${request.ciphertext}`);
    try {
      const combined = Buffer.from(request.ciphertext, 'base64');
      if (combined.length < 16) {
        throw new CryptoError(
          'Input validation',
          algorithm,
          'Invalid ciphertext length - missing IV',
          'INVALID_CIPHERTEXT_FORMAT'
        );
      }
      
      const iv = combined.subarray(0, 16);
      const encrypted = combined.subarray(16);
      
      const decipher = crypto.createDecipheriv(algorithm, this.encryptionKey, iv);
      
      let decrypted: Buffer;
      try {
        decrypted = Buffer.concat([
          decipher.update(encrypted),
          decipher.final()
        ]);
      } catch (decryptionError) {
        throw new CryptoError(
          'Data processing',
          algorithm,
          decryptionError,
          'DECRYPTION_PROCESSING_FAILURE'
        );
      }
      
      this.logger.debug('Decryption completed successfully.');
      return { plaintext: decrypted.toString('utf8') };
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new CryptoError(
        'Decryption',
        algorithm,
        error,
        'DECRYPTION_FAILURE'
      );
    }
  }
  deterministeEncrypt(
    request: DeterministicEncryptRequest
  ): DeterministicEncryptResponse {
    const algorithm = 'AES-256-ECB';
    try {
      const cipher = crypto.createCipheriv(algorithm, this.deterministicKey, null);
      
      let encrypted: Buffer;
      try {
        encrypted = Buffer.concat([
          cipher.update(request.plaintext, 'utf8'),
          cipher.final()
        ]);
      } catch (processingError) {
        throw new CryptoError(
          'Data processing',
          algorithm,
          processingError,
          'DETERMINISTIC_ENCRYPTION_FAILURE'
        );
      }
      
      return { ciphertext: encrypted.toString('base64') };
    } catch (error) {
      if (error instanceof CryptoError) throw error;
      throw new CryptoError(
        'Deterministic encryption',
        algorithm,
        error,
        'DETERMINISTIC_OPERATION_FAILURE'
      );
    }
  }

  async hash(request: HashRequest): Promise<HashResponse> {
    this.logger.debug(`Hashing plaintext: ${request.plaintext}`);
    try {
      const hash = await bcrypt.hash(request.plaintext, 10);
      this.logger.debug('Hashing completed successfully.');
      return { hash };
    } catch (error) {
      this.logger.error('Hashing failed', error);
      throw new CryptoError(
        'Password hashing',
        'bcrypt',
        error,
        'HASHING_FAILURE'
      );
    }
  }

  async verify(request: VerifyRequest): Promise<VerifyResponse> {
    this.logger.debug(`Verifying hash for plaintext: ${request.plaintext}`);
    try {
      const isValid = await bcrypt.compare(request.plaintext, request.hash);
      this.logger.debug(`Verification result: ${isValid}`);
      return { isValid };
    } catch (error) {
      this.logger.error('Verification failed', error);
      throw new CryptoError(
        'Hash verification',
        'bcrypt',
        error,
        'VERIFICATION_FAILURE'
      );
    }
  }
}