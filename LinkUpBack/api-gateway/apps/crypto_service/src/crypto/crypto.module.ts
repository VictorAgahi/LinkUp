import { Module } from '@nestjs/common';
import { CryptoController } from './crypto.controller';
import { CryptoServices } from './crypto.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),],
  controllers: [CryptoController],
  providers: [CryptoServices],
})
export class CryptoServiceModule {}
