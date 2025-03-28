import { IsNotEmpty, IsString } from 'class-validator';

export class RequestAccessTokenDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    constructor(userId: string, username: string) {
        this.userId = userId;
        this.username = username;
    }
}