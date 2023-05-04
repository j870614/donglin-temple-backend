import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface UserParams extends ParamsDictionary {
  test: string;
}

export interface UserDocument {
  id?: string;
  number?: number[];
  name?: string;
  email?: string;
  password?: string;
}

export interface UserRequest extends Request<UserParams, object, UserDocument> {
  name?: string;
}
