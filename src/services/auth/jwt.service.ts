/* eslint-disable @typescript-eslint/no-explicit-any */
import jsonwebtoken from "jsonwebtoken";

import {
  JwtModuleOptions,
  JwtSignOptions,
  JwtVerifyOptions
} from "@/models/auth/jwt.model";

export declare class JwtService {
  private readonly options;

  private readonly logger;

  constructor(options?: JwtModuleOptions);

  sign(payload: string | Buffer | object, options?: JwtSignOptions): string;
  signAsync(
    payload: string | Buffer | object,
    options?: JwtSignOptions
  ): Promise<string>;
  verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T;
  verifyAsync<T extends object = any>(
    token: string,
    options?: JwtVerifyOptions
  ): Promise<T>;
  decode(
    token: string,
    options?: jsonwebtoken.DecodeOptions
  ):
    | null
    | {
        [key: string]: any;
      }
    | string;
  private mergeJwtOptions;

  private getSecretKey;
}
