import { Controller } from '@nestjs/common';
import { DatabaseServiceControllerMethods } from '@app/common';
import {
  CreateUserRequest,
  CreateUserResponse,
  CheckUserExistsRequest,
  CheckUserExistsResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetMessageHistoryRequest,
  GetMessageHistoryResponse,
  LikeUserRequest,
  LikeUserResponse,
  CheckMutualLikeRequest,
  CheckMutualLikeResponse,
  GetLikedUsersRequest,
  GetLikedUsersResponse,
  MarkNotificationsAsReadRequest,
  MarkNotificationsAsReadResponse,
  GenerateJwtTokenRequest,
  GenerateJwtTokenResponse,
  VerifyJwtTokenRequest,
  VerifyJwtTokenResponse,
  CreateUserRelationRequest,
  CreateUserRelationResponse,
  GetNearbyUsersRequest,
  GetNearbyUsersResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  FilterConversationsRequest,
  FilterConversationsResponse,
  VerifyDataSecurityRequest,
  VerifyDataSecurityResponse,
  DatabaseServiceController
} from '@app/common';
import { DatabaseService } from './database.service';

@Controller()
@DatabaseServiceControllerMethods()
export class DatabaseController implements DatabaseServiceController {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(req: CreateUserRequest): Promise<CreateUserResponse> {
    return this.databaseService.createUser(req);
  }

  async checkUserExists(req: CheckUserExistsRequest): Promise<CheckUserExistsResponse> {
    return this.databaseService.checkUserExists(req);
  }

  async updateUser(req: UpdateUserRequest): Promise<UpdateUserResponse> {
    return this.databaseService.updateUser(req);
  }

  async createConversation(req: CreateConversationRequest): Promise<CreateConversationResponse> {
    return this.databaseService.createConversation(req);
  }

  async sendMessage(req: SendMessageRequest): Promise<SendMessageResponse> {
    return this.databaseService.sendMessage(req);
  }

  async getMessageHistory(req: GetMessageHistoryRequest): Promise<GetMessageHistoryResponse> {
    return this.databaseService.getMessageHistory(req);
  }

  async likeUser(req: LikeUserRequest): Promise<LikeUserResponse> {
    return this.databaseService.likeUser(req);
  }

  async checkMutualLike(req: CheckMutualLikeRequest): Promise<CheckMutualLikeResponse> {
    return this.databaseService.checkMutualLike(req);
  }

  async getLikedUsers(req: GetLikedUsersRequest): Promise<GetLikedUsersResponse> {
    return this.databaseService.getLikedUsers(req);
  }

  async markNotificationsAsRead(req: MarkNotificationsAsReadRequest): Promise<MarkNotificationsAsReadResponse> {
    return this.databaseService.markNotificationsAsRead(req);
  }

  async generateJwtToken(req: GenerateJwtTokenRequest): Promise<GenerateJwtTokenResponse> {
    return this.databaseService.generateJwtToken(req);
  }

  async verifyJwtToken(req: VerifyJwtTokenRequest): Promise<VerifyJwtTokenResponse> {
    return this.databaseService.verifyJwtToken(req);
  }

  async createUserRelation(req: CreateUserRelationRequest): Promise<CreateUserRelationResponse> {
    return this.databaseService.createUserRelation(req);
  }

  async getNearbyUsers(req: GetNearbyUsersRequest): Promise<GetNearbyUsersResponse> {
    return this.databaseService.getNearbyUsers(req);
  }

  async searchUsers(req: SearchUsersRequest): Promise<SearchUsersResponse> {
    return this.databaseService.searchUsers(req);
  }

  async filterConversations(req: FilterConversationsRequest): Promise<FilterConversationsResponse> {
    return this.databaseService.filterConversations(req);
  }

  async verifyDataSecurity(req: VerifyDataSecurityRequest): Promise<VerifyDataSecurityResponse> {
    return this.databaseService.verifyDataSecurity(req);
  }
}