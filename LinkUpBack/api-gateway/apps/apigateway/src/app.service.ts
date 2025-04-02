import { Injectable } from '@nestjs/common';
import { RequestService } from './request/request.service';
import { Logger } from '@nestjs/common';
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly requestService: RequestService){}
  getHello(): string {
    const userId = this.requestService.getUserId();
    this.logger.log(`get Hello USER ID: ${userId}`);
    return 'Hello World!';
  }
}
