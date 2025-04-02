import { 
    Injectable,
    HttpException,
    Logger, 
    ExceptionFilter, 
    Catch, 
    ArgumentsHost
} from "@nestjs/common";
import { Response } from "express";
import { RequestService } from "../request/request.service";
import { Request } from "express";   
import path from "path";

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
    constructor(private readonly requestService: RequestService) {}
    catch(exception: HttpException, host: ArgumentsHost){
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),        
            path: request.url,
        });

    }
}