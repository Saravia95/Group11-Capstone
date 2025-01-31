export enum Role {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  role: Role;
  assignedOwner?: string;
  createdAt: string;
  updatedAt: string;
}
