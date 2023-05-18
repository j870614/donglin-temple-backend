import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { users } from "@prisma/client";

export type UserParams = ParamsDictionary;

export interface GuestRequestBody extends users {
  ConfirmPassword?: string;
}

export interface GuestRequest
  extends Request<ParamsDictionary, object, GuestRequestBody> {
  ConfirmPassword?: string;
}

