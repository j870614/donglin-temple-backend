import jwt, { JwtPayload } from "jsonwebtoken";

import { ManagerRequestBody } from "../../models/managers.model";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_EXPIRATION = "7d";

export const generateAndSendJWT = (manager: ManagerRequestBody) => {
  const { UserId } = manager;
  const token = jwt.sign({ scopes: ["manager"], UserId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
  const { exp } = jwt.decode(token) as JwtPayload;

  return { userId: UserId, token, expired: exp };
};
