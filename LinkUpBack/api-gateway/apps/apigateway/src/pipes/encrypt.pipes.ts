import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { CryptoServiceClient } from '@app/common';
import { ClientGrpc } from "@nestjs/microservices";
import { Inject } from '@nestjs/common';
import { Observable, lastValueFrom } from 'rxjs';
import { CRYPTO_SERVICE } from "../utils/constants";
import { CRYPTO_SERVICE_NAME } from "@app/common";
import { Logger } from "@nestjs/common";


export class EncryptPipe implements PipeTransform {
    private cryptoService: CryptoServiceClient;
    private readonly logger = new Logger(EncryptPipe.name);

    constructor(@Inject(CRYPTO_SERVICE) private cryptoClient: ClientGrpc) {
      this.cryptoService = this.cryptoClient.getService<CryptoServiceClient>(
        CRYPTO_SERVICE_NAME 
      );
    }

  async transform(value: any, metadata: ArgumentMetadata) {
    if (!value.email || !value.password) return value;
    try {
      const [emailEncrypted, passwordEncrypted] = await Promise.all([
        this.encryptField(value.email),
        this.encryptField(value.password)
      ]);

      value.email = emailEncrypted;
      value.password = passwordEncrypted;
      this.logger.log("EMAIL ENCRYPTED BY PIPES : " + value.email);
      this.logger.log("PASSWORD ENCRYPTED BY PIPES : " + value.password);

      return value;
    } catch (error) {
      throw new Error('Error encrypting fields');
    }
  }

  private encryptField(plaintext: string): Promise<string> {
    const encryptRequest = { plaintext };

    return lastValueFrom(this.cryptoService.encrypt(encryptRequest)).then(
      (response) => response.ciphertext
    );
  }
}