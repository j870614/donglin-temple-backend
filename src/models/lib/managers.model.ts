export interface SignUpByEmailRequest {
  UserId: number;
  Email: string;
  Password: string;
  ConfirmPassword: string;
}

export interface SignInByEmailRequest {
  Email: string;
  Password: string;
}

export interface QRCodeRequest {
  AuthorizeUserId: number;
  UserId: number;
  DeaconName: string;
}