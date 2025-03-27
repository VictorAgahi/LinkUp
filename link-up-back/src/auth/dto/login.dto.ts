import {IsEmail, IsString, Length, MinLength} from 'class-validator';

export class LoginDto {


    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 20)
    password: string;
}