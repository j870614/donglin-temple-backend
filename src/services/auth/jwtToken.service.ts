import jwt, { JwtPayload } from "jsonwebtoken";
import { managers } from "@prisma/client";
import {
  JwtModuleOptions
  // JwtSignOptions,
  // JwtVerifyOptions
} from "../../models";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_EXPIRATION = "7d";

export const generateAndSendJWT = (manager: managers) => {
  const { UserId } = manager;
  const token = jwt.sign({ scopes: ["manager"], UserId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
  const { exp } = jwt.decode(token) as JwtPayload;

  return { userId: UserId, token, expired: exp };
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
