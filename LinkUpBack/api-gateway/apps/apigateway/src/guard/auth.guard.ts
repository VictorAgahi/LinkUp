import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { Logger } from "@nestjs/common";


@Injectable()
export class AuthGuard implements CanActivate {

    private readonly logger = new Logger(AuthGuard.name);
    canActivate (context: ExecutionContext)
    : boolean | Promise<boolean> | Observable<boolean> 
    {
        const request = context.switchToHttp().getRequest();
        return true;
    }
}