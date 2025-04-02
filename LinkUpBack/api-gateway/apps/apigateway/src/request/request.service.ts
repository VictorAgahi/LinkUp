import { Injectable, Scope } from '@nestjs/common';

@Injectable({scope: Scope.REQUEST})
export class RequestService {
    private userId : string ;
    getUserId() : string {
        return this.userId;
    }
    setUserId(userId: string) {
        this.userId = userId;
    }
}
