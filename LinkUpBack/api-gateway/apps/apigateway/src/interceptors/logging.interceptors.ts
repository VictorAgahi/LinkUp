import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestService } from '../request/request.service';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
    constructor(private readonly requestService: RequestService) {}
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const userAgent = request.get['user-agent'] || 'Unknown';
        const {ip, method, path: url } = request;
        this.logger.log(`Request: ${method} ${url} ${userAgent} ${ip} : ${context.getClass().name} : ${context.getHandler().name} invoked.. `);

        this.logger.debug(`userId : ${this.requestService.getUserId()}`);
        const now = Date.now();
        return next.handle().pipe(tap((res) => {const responseTime = Date.now() - now; this.logger.log(`Response: ${method} ${url} ${userAgent} ${ip} : ${context.getClass().name} : ${context.getHandler().name} invoked.. `); this.logger.debug(`userId : ${this.requestService.getUserId()}`); this.logger.log(`Response time: ${responseTime}ms`);}));
    }
}