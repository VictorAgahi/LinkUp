import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateUserRequest, CreateUserResponse,
  CheckUserExistsRequest, CheckUserExistsResponse,
  UpdateUserRequest, UpdateUserResponse,
  CreateConversationRequest, CreateConversationResponse,
  SendMessageRequest, SendMessageResponse,
  GetMessageHistoryRequest, GetMessageHistoryResponse,
  LikeUserRequest, LikeUserResponse,
  CheckMutualLikeRequest, CheckMutualLikeResponse,
  GetLikedUsersRequest, GetLikedUsersResponse,
  MarkNotificationsAsReadRequest, MarkNotificationsAsReadResponse,
  GenerateJwtTokenRequest, GenerateJwtTokenResponse,
  VerifyJwtTokenRequest, VerifyJwtTokenResponse,
  CreateUserRelationRequest, CreateUserRelationResponse,
  GetNearbyUsersRequest, GetNearbyUsersResponse,
  SearchUsersRequest, SearchUsersResponse,
  FilterConversationsRequest, FilterConversationsResponse,
  VerifyDataSecurityRequest, VerifyDataSecurityResponse
} from '@app/common';
import neo4j, { Driver } from 'neo4j-driver';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private driver: Driver | null = null;

  constructor() {
    super();

    const NEO4J_URI = process.env.NEO4J_URI;
    const NEO4J_USER = process.env.NEO4J_USERNAME;
    const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

    if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
      throw new Error('Missing required Neo4j environment variables: NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD');
    }

    try {
      this.driver = neo4j.driver(
        NEO4J_URI,
        neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
      );
      this.logger.log('Neo4j Driver initialized');
    } catch (error) {
      this.logger.error('❌ Error initializing Neo4j Driver', error);
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to PostgreSQL');
    } catch (error) {
      this.logger.error('❌ Error connecting to PostgreSQL', error);
    }

    if (this.driver) {
      try {
        await this.driver.verifyConnectivity();
        this.logger.log('✅ Connected to Neo4j');
      } catch (error) {
        this.logger.error('❌ Error connecting to Neo4j', error);
      }
    }
  }

  async executeQuery(query: string, params: Record<string, any> = {}) {
    if (!this.driver) {
      this.logger.error('❌ Cannot execute query: Neo4j driver is not initialized');
      return null;
    }
    const session = this.driver.session();
    try {
      return await session.run(query, params);
    } catch (error) {
      this.logger.error('❌ Error executing Neo4j query', error);
      return null;
    } finally {
      await session.close();
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('❌ Disconnected from PostgreSQL');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from PostgreSQL', error);
    }

    if (this.driver) {
      try {
        await this.driver.close();
        this.logger.log('🛑 Neo4j driver closed.');
      } catch (error) {
        this.logger.error('❌ Error closing Neo4j driver', error);
      }
    }
  }

  getDriver(): Driver | null {
    return this.driver;
  }

  async createUser(req: CreateUserRequest): Promise<CreateUserResponse> {
    this.logger.log(`Creating user: ${JSON.stringify(req)}`);
    const userId = 'some-generated-id';
    return { userId };
  }

  async checkUserExists(req: CheckUserExistsRequest): Promise<CheckUserExistsResponse> {
    this.logger.log(`Checking if user exists: ${JSON.stringify(req)}`);
    return { exists: true };
  }

  async updateUser(req: UpdateUserRequest): Promise<UpdateUserResponse> {
    this.logger.log(`Updating user: ${JSON.stringify(req)}`);
    return { success: true };
  }

  async createConversation(req: CreateConversationRequest): Promise<CreateConversationResponse> {
    this.logger.log(`Creating conversation: ${JSON.stringify(req)}`);
    return { conversationId: 'some-conversation-id' };
  }

  async sendMessage(req: SendMessageRequest): Promise<SendMessageResponse> {
    this.logger.log(`Sending message: ${JSON.stringify(req)}`);
    return { success: true };
  }

  async getMessageHistory(req: GetMessageHistoryRequest): Promise<GetMessageHistoryResponse> {
    this.logger.log(`Fetching message history: ${JSON.stringify(req)}`);
    return { messages: ['Hello', 'How are you?'] };
  }

  async likeUser(req: LikeUserRequest): Promise<LikeUserResponse> {
    this.logger.log(`Liking user: ${JSON.stringify(req)}`);
    return { success: true };
  }

  async checkMutualLike(req: CheckMutualLikeRequest): Promise<CheckMutualLikeResponse> {
    this.logger.log(`Checking mutual like: ${JSON.stringify(req)}`);
    return { isMutual: true };
  }

  async getLikedUsers(req: GetLikedUsersRequest): Promise<GetLikedUsersResponse> {
    this.logger.log(`Getting liked users: ${JSON.stringify(req)}`);
    return { likedUserIds: ['user1', 'user2'] };
  }

  async markNotificationsAsRead(req: MarkNotificationsAsReadRequest): Promise<MarkNotificationsAsReadResponse> {
    this.logger.log(`Marking notifications as read: ${JSON.stringify(req)}`);
    return { success: true };
  }

  async generateJwtToken(req: GenerateJwtTokenRequest): Promise<GenerateJwtTokenResponse> {
    this.logger.log(`Generating JWT token for user: ${JSON.stringify(req)}`);
    return { jwtToken: 'generated-jwt-token' };
  }

  async verifyJwtToken(req: VerifyJwtTokenRequest): Promise<VerifyJwtTokenResponse> {
    this.logger.log(`Verifying JWT token: ${JSON.stringify(req)}`);
    return { valid: true, userId: 'user-id-from-token' };
  }

  async createUserRelation(req: CreateUserRelationRequest): Promise<CreateUserRelationResponse> {
    this.logger.log(`Creating user relation: ${JSON.stringify(req)}`);
    return { success: true };
  }

  async getNearbyUsers(req: GetNearbyUsersRequest): Promise<GetNearbyUsersResponse> {
    this.logger.log(`Fetching nearby users: ${JSON.stringify(req)}`);
    return { nearbyUserIds: ['user1', 'user2'] };
  }

  async searchUsers(req: SearchUsersRequest): Promise<SearchUsersResponse> {
    this.logger.log(`Searching users with query: ${JSON.stringify(req)}`);
    return { userIds: ['user1', 'user2'] };
  }

  async filterConversations(req: FilterConversationsRequest): Promise<FilterConversationsResponse> {
    this.logger.log(`Filtering conversations: ${JSON.stringify(req)}`);
    return { conversationIds: ['conversation1', 'conversation2'] };
  }

  async verifyDataSecurity(req: VerifyDataSecurityRequest): Promise<VerifyDataSecurityResponse> {
    this.logger.log(`Verifying data security for user: ${JSON.stringify(req)}`);
    return { isSecure: true };
  }
}