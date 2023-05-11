import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { managers } from "@prisma/client";

export type ManagerParams = ParamsDictionary;

export interface ManagerRequestBody extends managers {
  ConfirmPassword?: string;
  times?: number;
}

export interface ManagerRequest
  extends Request<ParamsDictionary, object, ManagerRequestBody> {
  ConfirmPassword?: string;
}

export interface ManagerInfo {
  Id?: number;
  Email: string;
  Password: string;
}
