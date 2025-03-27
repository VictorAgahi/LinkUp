import {IsEmail, IsString, Length, MinLength} from 'class-validator';

export class RegisterDto {


    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

}