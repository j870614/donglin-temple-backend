import jwt, { JwtPayload } from "jsonwebtoken";

import { ManagerRequestBody } from "../../models/managers.model";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_EXPIRATION = "7d";

export const generateAndSendJWT = (manager: ManagerRequestBody) => {
  const { Id, UserId } = manager;
  const token = jwt.sign({ Id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
    audience: ["manager"]
  });
  const { exp } = jwt.decode(token) as JwtPayload;

  return { managerId: Id, userId: UserId, token, expired: exp };
};
