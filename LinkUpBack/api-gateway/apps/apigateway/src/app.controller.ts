import { Controller, Get, HttpException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('error')
  error(): string {
    throw new HttpException('Forbidden', 403);
  }
}
