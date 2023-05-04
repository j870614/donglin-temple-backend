import jsonwebtoken from "jsonwebtoken";

export declare enum JwtSecretRequestType {
  SIGN = 0,
  VERIFY = 1
}

export interface JwtModuleOptions {
  global?: boolean;
  signOptions?: jsonwebtoken.SignOptions;
  secret?: string | Buffer;
  publicKey?: string | Buffer;
  privateKey?: jsonwebtoken.Secret;
  secretOrPrivateKey?: jsonwebtoken.Secret;
  secretOrKeyProvider?: (
    requestType: JwtSecretRequestType,
    tokenOrPayload: string | object | Buffer,
    options?: jsonwebtoken.VerifyOptions | jsonwebtoken.SignOptions
  ) => jsonwebtoken.Secret;
  verifyOptions?: jsonwebtoken.VerifyOptions;
}

export interface JwtOptionsFactory {
  createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions;
}

// export interface JwtModuleAsyncOptions {
// }

export interface JwtSignOptions extends jsonwebtoken.SignOptions {
  secret?: string | Buffer;
  privateKey?: jsonwebtoken.Secret;
}

export interface JwtVerifyOptions extends jsonwebtoken.VerifyOptions {
  secret?: string | Buffer;
  publicKey?: string | Buffer;
}
