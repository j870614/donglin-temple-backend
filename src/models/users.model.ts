import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { users } from "@prisma/client";

export type UserParams = ParamsDictionary;

export interface UserRequestBody extends users {
  ConfirmPassword?: string;
}

export interface UserRequest
  extends Request<ParamsDictionary, object, UserRequestBody> {
  ConfirmPassword?: string;
}

export interface UserInfo {
  Id?: number;
  Email: string;
  Password: string;
}
