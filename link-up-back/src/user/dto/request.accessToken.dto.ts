import { IsNotEmpty, IsString } from 'class-validator';

export class RequestAccessTokenDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }
}