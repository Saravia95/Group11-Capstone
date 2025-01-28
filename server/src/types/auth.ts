export interface SignUpInputDto {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export interface SignInInputDto {
  email: string;
  password: string;
}

export interface RequestPasswordResetInputDto {
  email: string;
}

export interface ResetPasswordInputDto {
  accessToken: string;
  password: string;
}

export interface SignInOutputDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
  };
}
