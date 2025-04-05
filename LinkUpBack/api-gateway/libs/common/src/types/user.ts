// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.0
//   protoc               v5.29.3
// source: user.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackageUser = "user";

export interface GetUserByIdRequest {
  userId: string;
}

export interface GetUserByIdResponse {
  userId: string;
  username: string;
  email: string;
}

export interface GetUserByEmailOrUsernameRequest {
  emailOrUsername: string;
}

export interface GetUserByEmailOrUsernameResponse {
  userId: string;
  username: string;
  email: string;
}

export interface UpdateUserProfileRequest {
  userId: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
}

export interface UpdateUserProfileResponse {
  success: boolean;
}

export interface DeleteUserRequest {
  userId: string;
}

export interface DeleteUserResponse {
  success: boolean;
}

export interface LikeUserFromUserServiceRequest {
  userId: string;
  targetUserId: string;
}

export interface LikeUserFromUserServiceResponse {
  success: boolean;
}

export interface UnlikeUserRequest {
  userId: string;
  targetUserId: string;
}

export interface UnlikeUserResponse {
  success: boolean;
}

export interface GetLikedUsersFromUserServiceRequest {
  userId: string;
}

export interface GetLikedUsersFromUserServiceResponse {
  likedUserIds: string[];
}

export interface GetMatchesRequest {
  userId: string;
}

export interface GetMatchesResponse {
  matchedUserIds: string[];
}

export interface SearchUsersFromUserServiceRequest {
  query: string;
}

export interface SearchUsersFromUserServiceResponse {
  userIds: string[];
}

export interface GetSuggestedUsersRequest {
  userId: string;
}

export interface GetSuggestedUsersResponse {
  suggestedUserIds: string[];
}

export interface UpdateUserStatusRequest {
  userId: string;
  status: string;
}

export interface UpdateUserStatusResponse {
  success: boolean;
}

export interface IsUserOnlineRequest {
  userId: string;
}

export interface IsUserOnlineResponse {
  isOnline: boolean;
}

export interface ToggleNotificationsRequest {
  userId: string;
  enableNotifications: boolean;
}

export interface ToggleNotificationsResponse {
  success: boolean;
}

export interface GetUserNotificationsRequest {
  userId: string;
}

export interface GetUserNotificationsResponse {
  notifications: string[];
}

export const USER_PACKAGE_NAME = "user";

export interface UserServiceClient {
  getUserById(request: GetUserByIdRequest): Observable<GetUserByIdResponse>;

  getUserByEmailOrUsername(request: GetUserByEmailOrUsernameRequest): Observable<GetUserByEmailOrUsernameResponse>;

  updateUserProfile(request: UpdateUserProfileRequest): Observable<UpdateUserProfileResponse>;

  deleteUser(request: DeleteUserRequest): Observable<DeleteUserResponse>;

  likeUser(request: LikeUserFromUserServiceRequest): Observable<LikeUserFromUserServiceResponse>;

  unlikeUser(request: UnlikeUserRequest): Observable<UnlikeUserResponse>;

  getLikedUsers(request: GetLikedUsersFromUserServiceRequest): Observable<GetLikedUsersFromUserServiceResponse>;

  getMatches(request: GetMatchesRequest): Observable<GetMatchesResponse>;

  searchUsers(request: SearchUsersFromUserServiceRequest): Observable<SearchUsersFromUserServiceResponse>;

  getSuggestedUsers(request: GetSuggestedUsersRequest): Observable<GetSuggestedUsersResponse>;

  updateUserStatus(request: UpdateUserStatusRequest): Observable<UpdateUserStatusResponse>;

  isUserOnline(request: IsUserOnlineRequest): Observable<IsUserOnlineResponse>;

  toggleNotifications(request: ToggleNotificationsRequest): Observable<ToggleNotificationsResponse>;

  getUserNotifications(request: GetUserNotificationsRequest): Observable<GetUserNotificationsResponse>;
}

export interface UserServiceController {
  getUserById(
    request: GetUserByIdRequest,
  ): Promise<GetUserByIdResponse> | Observable<GetUserByIdResponse> | GetUserByIdResponse;

  getUserByEmailOrUsername(
    request: GetUserByEmailOrUsernameRequest,
  ):
    | Promise<GetUserByEmailOrUsernameResponse>
    | Observable<GetUserByEmailOrUsernameResponse>
    | GetUserByEmailOrUsernameResponse;

  updateUserProfile(
    request: UpdateUserProfileRequest,
  ): Promise<UpdateUserProfileResponse> | Observable<UpdateUserProfileResponse> | UpdateUserProfileResponse;

  deleteUser(
    request: DeleteUserRequest,
  ): Promise<DeleteUserResponse> | Observable<DeleteUserResponse> | DeleteUserResponse;

  likeUser(
    request: LikeUserFromUserServiceRequest,
  ):
    | Promise<LikeUserFromUserServiceResponse>
    | Observable<LikeUserFromUserServiceResponse>
    | LikeUserFromUserServiceResponse;

  unlikeUser(
    request: UnlikeUserRequest,
  ): Promise<UnlikeUserResponse> | Observable<UnlikeUserResponse> | UnlikeUserResponse;

  getLikedUsers(
    request: GetLikedUsersFromUserServiceRequest,
  ):
    | Promise<GetLikedUsersFromUserServiceResponse>
    | Observable<GetLikedUsersFromUserServiceResponse>
    | GetLikedUsersFromUserServiceResponse;

  getMatches(
    request: GetMatchesRequest,
  ): Promise<GetMatchesResponse> | Observable<GetMatchesResponse> | GetMatchesResponse;

  searchUsers(
    request: SearchUsersFromUserServiceRequest,
  ):
    | Promise<SearchUsersFromUserServiceResponse>
    | Observable<SearchUsersFromUserServiceResponse>
    | SearchUsersFromUserServiceResponse;

  getSuggestedUsers(
    request: GetSuggestedUsersRequest,
  ): Promise<GetSuggestedUsersResponse> | Observable<GetSuggestedUsersResponse> | GetSuggestedUsersResponse;

  updateUserStatus(
    request: UpdateUserStatusRequest,
  ): Promise<UpdateUserStatusResponse> | Observable<UpdateUserStatusResponse> | UpdateUserStatusResponse;

  isUserOnline(
    request: IsUserOnlineRequest,
  ): Promise<IsUserOnlineResponse> | Observable<IsUserOnlineResponse> | IsUserOnlineResponse;

  toggleNotifications(
    request: ToggleNotificationsRequest,
  ): Promise<ToggleNotificationsResponse> | Observable<ToggleNotificationsResponse> | ToggleNotificationsResponse;

  getUserNotifications(
    request: GetUserNotificationsRequest,
  ): Promise<GetUserNotificationsResponse> | Observable<GetUserNotificationsResponse> | GetUserNotificationsResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getUserById",
      "getUserByEmailOrUsername",
      "updateUserProfile",
      "deleteUser",
      "likeUser",
      "unlikeUser",
      "getLikedUsers",
      "getMatches",
      "searchUsers",
      "getSuggestedUsers",
      "updateUserStatus",
      "isUserOnline",
      "toggleNotifications",
      "getUserNotifications",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_SERVICE_NAME = "UserService";
