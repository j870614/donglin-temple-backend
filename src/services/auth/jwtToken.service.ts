import jwt, { JwtPayload } from "jsonwebtoken";
import { managers } from "@prisma/client";
import prisma from "../../configs/prismaClient";

import {
  JwtModuleOptions
  // JwtSignOptions,
  // JwtVerifyOptions
} from "../../models";
import { CommonService } from "../common.service";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_EXPIRATION = "7d";

export const generateAndSendJWT = async (manager: managers) => {
  const { UserId, DeaconId } = manager;
  const user = await prisma.users.findFirst({
    where: { Id: UserId?.valueOf() },
    select: { 
      Name: true,
      DharmaName: true
    }
  });

  const userName = user?.DharmaName || user?.Name || "unknown";
  const deaconName = CommonService.getDeaconNameById(DeaconId)

  const token = jwt.sign({ 
    scopes: ["manager"], 
    UserId, 
    UserName: userName,
    DeaconName: deaconName
   }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
  const { exp } = jwt.decode(token) as JwtPayload;

  return { 
    userId: UserId, 
    userName, 
    deaconName, 
    token, 
    expired: exp 
  };
};

export class JwtService {
  private readonly options;

  // private readonly logger;

  constructor(options?: JwtModuleOptions) {
    this.options = options;
  }

  // sign(payload: string | Buffer | object, options?: JwtSignOptions): string;
  // signAsync(
  //   payload: string | Buffer | object,
  //   options?: JwtSignOptions
  // ): Promise<string>;
  // verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T;
  // verifyAsync<T extends object = any>(
  //   token: string,
  //   options?: JwtVerifyOptions
  // ): Promise<T>;
  // decode(
  //   token: string,
  //   options?: jwt.DecodeOptions
  // ):
  //   | null
  //   | {
  //       [key: string]: any;
  //     }
  //   | string;
  // private mergeJwtOptions;

  // private getSecretKey;
}
