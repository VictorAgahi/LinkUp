

export class UserEntity {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string,
        createdAt: Date,
        updatedAt: Date,
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}