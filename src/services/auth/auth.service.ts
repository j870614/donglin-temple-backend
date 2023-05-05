import { JwtService } from "./jwt.service";

export class AuthService {
  private readonly jwt_expiration: string = "7d";

  private readonly jwt_issuer: string = "DongLin-Temple-Backend";

  constructor(
    private readonly _jwt: JwtService,
    private readonly _user: ManagerService
  ) {}
}
