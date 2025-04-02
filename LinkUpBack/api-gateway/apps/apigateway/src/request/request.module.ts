import { RequestService } from "./request.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [RequestService],
    exports: [RequestService],
})
export class RequestModule {}