/* eslint-disable  */
import { Request } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

export function expressAuthentication(
  req: Request,
  securityName: string,
  scopes?: string[]
) {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer")) {
    throw new Error("Authorization header 丟失");
  }

  const [, token] = authorization.split(" ");
  if (!token) {
    throw new Error("Token 丟失");
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, function (err: any, decoded: any) {
      if (err) {
        reject(err);
      }

      if (scopes) {
        for (let scope of scopes) {
          if (!decoded.aud.includes(scope)) {
            reject(new Error("JWT token 沒有包含必須的 scope"));
          }
        }
      }

      resolve(decoded);
    });
  });
}
