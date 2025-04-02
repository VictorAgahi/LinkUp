import { Module } from '@nestjs/common';
import { CryptoServiceModule } from './crypto/crypto.module';


@Module({
  imports: [CryptoServiceModule],
  controllers: [],
  providers: [],
})
export class Crypto_ServiceModule {}
