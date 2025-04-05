import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import {
  DeleteUserRequest,
  DeleteUserResponse,
  GetLikedUsersFromUserServiceRequest,
  GetLikedUsersFromUserServiceResponse,
  GetMatchesRequest,
  GetMatchesResponse,
  GetSuggestedUsersRequest,
  GetSuggestedUsersResponse,
  GetUserByEmailOrUsernameRequest,
  GetUserByEmailOrUsernameResponse,
  GetUserByIdRequest,
  GetUserByIdResponse,
  GetUserNotificationsRequest,
  GetUserNotificationsResponse,
  IsUserOnlineRequest,
  IsUserOnlineResponse,
  LikeUserFromUserServiceRequest,
  LikeUserFromUserServiceResponse,
  SearchUsersFromUserServiceRequest,
  SearchUsersFromUserServiceResponse,
  ToggleNotificationsRequest,
  ToggleNotificationsResponse,
  UnlikeUserRequest,
  UnlikeUserResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
  UserServiceClient,
  UserServiceControllerMethods,
} from '@app/common/types/user';
import { Observable } from 'rxjs';

@Controller()
@UserServiceControllerMethods()
export class UserController implements UserServiceClient {
  constructor(private readonly userServiceService: UserService) {}

  deleteUser(request: DeleteUserRequest): Observable<DeleteUserResponse> {
    return this.userServiceService.deleteUser(request);
  }

  getLikedUsers(request: GetLikedUsersFromUserServiceRequest): Observable<GetLikedUsersFromUserServiceResponse> {
    return this.userServiceService.getLikedUsers(request);
  }

  getMatches(request: GetMatchesRequest): Observable<GetMatchesResponse> {
    return this.userServiceService.getMatches(request);
  }

  getSuggestedUsers(request: GetSuggestedUsersRequest): Observable<GetSuggestedUsersResponse> {
    return this.userServiceService.getSuggestedUsers(request);
  }

  getUserByEmailOrUsername(request: GetUserByEmailOrUsernameRequest): Observable<GetUserByEmailOrUsernameResponse> {
    return this.userServiceService.getUserByEmailOrUsername(request);
  }

  getUserById(request: GetUserByIdRequest): Observable<GetUserByIdResponse> {
    return this.userServiceService.getUserById(request);
  }

  getUserNotifications(request: GetUserNotificationsRequest): Observable<GetUserNotificationsResponse> {
    return this.userServiceService.getUserNotifications(request);
  }

  isUserOnline(request: IsUserOnlineRequest): Observable<IsUserOnlineResponse> {
    return this.userServiceService.isUserOnline(request);
  }

  likeUser(request: LikeUserFromUserServiceRequest): Observable<LikeUserFromUserServiceResponse> {
    return this.userServiceService.likeUser(request);
  }

  searchUsers(request: SearchUsersFromUserServiceRequest): Observable<SearchUsersFromUserServiceResponse> {
    return this.userServiceService.searchUsers(request);
  }

  toggleNotifications(request: ToggleNotificationsRequest): Observable<ToggleNotificationsResponse> {
    return this.userServiceService.toggleNotifications(request);
  }

  unlikeUser(request: UnlikeUserRequest): Observable<UnlikeUserResponse> {
    return this.userServiceService.unlikeUser(request);
  }

  updateUserProfile(request: UpdateUserProfileRequest): Observable<UpdateUserProfileResponse> {
    return this.userServiceService.updateUserProfile(request);
  }

  updateUserStatus(request: UpdateUserStatusRequest): Observable<UpdateUserStatusResponse> {
    return this.userServiceService.updateUserStatus(request);
  }
}