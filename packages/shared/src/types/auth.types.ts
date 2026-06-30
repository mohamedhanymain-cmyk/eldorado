/** Login request DTO */
export interface LoginDto {
  email: string;
  password: string;
}

/** Register request DTO (Owner-only action) */
export interface RegisterDto {
  email: string;
  password: string;
  role?: string;
}

/** JWT access token payload */
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Auth response with tokens */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

/** Refresh token request */
export interface RefreshTokenDto {
  refreshToken: string;
}

/** Change password request */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/** Force reset password (Owner action) */
export interface ForceResetPasswordDto {
  newPassword: string;
}

/** Session info for login history */
export interface SessionInfo {
  id: string;
  userId: string;
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
  lastActiveAt: string;
}
