import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserRequest, DeleteUserRequest, UpdateUserRequest, UserResponse } from '@app/common';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private users: UserResponse[] = [];

  onModuleInit() {
    this.logger.log('Initializing fake database...');
    this.users = [
      {
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
      },
      {
        id: uuidv4(),
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane.smith@example.com',
      },
    ];
    this.logger.log(`Fake database initialized with ${this.users.length} users.`);
  }

  async create(request: CreateUserRequest): Promise<UserResponse> {
    const newUser: UserResponse = {
      id: uuidv4(),
      firstName: request.firstName,
      lastName: request.lastName,
      username: request.username,
      email: request.email,
    };

    this.users.push(newUser);
    this.logger.log(`User created: ${JSON.stringify(newUser)}`);
    return newUser;
  }

  // Récupérer tous les utilisateurs
  async findAll(): Promise<UserResponse[]> {
    this.logger.log(`Fetching all users (${this.users.length} found)`);
    return this.users;
  }

  // Récupérer un utilisateur par ID
  async findOne(id: string): Promise<UserResponse> {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new Error('User not found');
    }
    this.logger.log(`User found: ${JSON.stringify(user)}`);
    return user;
  }

  // Mise à jour d'un utilisateur
  async update(request: UpdateUserRequest): Promise<UserResponse> {
    const userIndex = this.users.findIndex((user) => user.id === request.id);
    if (userIndex === -1) {
      this.logger.warn(`User with ID ${request.id} not found for update`);
      throw new Error('User not found');
    }

    const updatedUser: UserResponse = {
      ...this.users[userIndex],
      firstName: request.firstName ?? this.users[userIndex].firstName,
      lastName: request.lastName ?? this.users[userIndex].lastName,
      username: request.username ?? this.users[userIndex].username,
      email: request.email ?? this.users[userIndex].email,
    };

    this.users[userIndex] = updatedUser;
    this.logger.log(`User updated: ${JSON.stringify(updatedUser)}`);
    return updatedUser;
  }

  // Suppression d'un utilisateur
  async remove(request: DeleteUserRequest): Promise<UserResponse> {
    const userIndex = this.users.findIndex((user) => user.id === request.id);
    if (userIndex === -1) {
      this.logger.warn(`User with ID ${request.id} not found for deletion`);
      throw new Error('User not found');
    }

    const removedUser = this.users.splice(userIndex, 1)[0];
    this.logger.log(`User deleted: ${JSON.stringify(removedUser)}`);
    return removedUser;
  }
}