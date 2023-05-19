/* eslint-disable  */
import { Request } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

export function expressAuthentication(
  req: Request,
  securityName: string,
  scopes?: string[]
) {
  return new Promise((resolve, reject) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer")) {
      reject(new Error("Authorization header 丟失"));
      return;
    }

    const [, token] = authorization.split(" ");
    if (!token) {
      reject(new Error("Token 丟失"));
      return;
    }

    jwt.verify(token, JWT_SECRET, function (err: any, decoded: any) {
      if (err) {
        reject(err);
        return;
      }

      if (scopes) {
        for (let scope of scopes) {
          if (!decoded.scopes.includes(scope)) {
            reject(new Error("JWT token 沒有包含必須的 scope"));
            return;
          }
        }
      }

      resolve(decoded);
    });
  });
}
