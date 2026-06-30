/** Create user DTO (Owner/Admin action) */
export interface CreateUserDto {
  email: string;
  password: string;
  role: string;
}

/** Update user DTO */
export interface UpdateUserDto {
  email?: string;
  role?: string;
  isActive?: boolean;
}

/** User response DTO — never expose passwordHash */
export interface UserResponseDto {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
