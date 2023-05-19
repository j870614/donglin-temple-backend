import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { rooms } from "@prisma/client";

export type RoomParams = ParamsDictionary;

export interface RoomRequestBody extends rooms{
  ConfirmPassword?: string;
}

export interface GuestRequest
  extends Request<ParamsDictionary, object, RoomRequestBody> {
  ConfirmPassword?: string;
}

