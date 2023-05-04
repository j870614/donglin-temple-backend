import jsonwebtoken from "jsonwebtoken";

import { JwtModuleOptions } from "@/models/auth/jwt.model";

export declare class JwtService {
  private readonly options;

  private readonly logger;
  constructor(options?: JwtModuleOptions);
}
