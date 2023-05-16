import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { buddha_seven_periods } from "@prisma/client";

export type BuddhaSevenParams = ParamsDictionary;

export type BuddhaSevenRequest = Request<
  ParamsDictionary,
  object,
  buddha_seven_periods
>;

// export interface BuddhaSevenRequestBody extends buddha_seven_periods{
//   Remark: string,
// }

// export interface BuddhaSevenRequest
//   extends Request<ParamsDictionary, object, buddha_seven_periods> {
//   Remark: string,
// }

