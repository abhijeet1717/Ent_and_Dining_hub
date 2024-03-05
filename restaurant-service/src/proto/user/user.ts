/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "user";

export interface TokenRequest {
  token: string;
}

export interface TokenResponse {
  isValid: boolean;
  userId: string;
}

export interface UserInfoRequest {
  userId: string;
}

export interface UserInfoResponse {
  name: string;
  email: string;
}

export const USER_PACKAGE_NAME = "user";

export interface UserServiceClient {
  validate(request: TokenRequest): Observable<TokenResponse>;

  getUser(request: UserInfoRequest): Observable<UserInfoResponse>;
}

export interface UserServiceController {
  validate(request: TokenRequest): Promise<TokenResponse> | Observable<TokenResponse> | TokenResponse;

  getUser(request: UserInfoRequest): Promise<UserInfoResponse> | Observable<UserInfoResponse> | UserInfoResponse;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["validate", "getUser"];
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
