import { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Request, Response, NextFunction as NestFunction } from "express";
import { RequestService } from "../request/request.service";
import { Logger } from "@nestjs/common";
import { stringify } from "querystring";
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {

    private readonly logger = new Logger(AuthenticationMiddleware.name);
    constructor(private readonly requestService: RequestService) {}

    use(req: Request, res: Response, next: NestFunction   ) {
    const userId = '123';
    this.requestService.setUserId(userId);
    this.logger.log(AuthenticationMiddleware.name);
    this.logger.log(`Request :  ${stringify(req.body)}`);
    next();
  }
}
