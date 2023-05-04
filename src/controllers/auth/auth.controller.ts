export class AuthService {
  private readonly jwtExpiration: string = "7d";

  private readonly jwtIssuer: string = "DongLin-Temple-Core";

  constructor(
    private readonly _jwt: JwtService,
    private readonly _user: UserService
  ) {}
}
