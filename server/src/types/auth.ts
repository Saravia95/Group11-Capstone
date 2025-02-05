export enum Role {
  Admin = 'admin',
  Customer = 'customer',
}

export interface SignUpInputDto {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: Role;
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
  refreshToken: string;
  newPassword: string;
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

export interface verifyQRCodeInputDto {
  id: string;
}

export interface fetchMembershipInputDto {
  id: string;
  email: string;
}
export interface cancelMembershipInputDto {
  id: string;
  email: string;
}

export interface manageMembershipInputDto {
  id: string;
  email: string;
}

export interface createCheckoutSessionInputDto {
  id: string;
  email: string;
}
