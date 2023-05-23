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
