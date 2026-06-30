import type { PaginationQuery } from "./common.types";

/** Create account DTO — all fields for a new digital account */
export interface CreateAccountDto {
  platform: string;
  category: string;
  email: string;
  password: string; // Plaintext — encrypted by the service layer
  recoveryEmail?: string;
  recoveryPassword?: string; // Plaintext — encrypted by the service layer
  username?: string;
  twoFactorStatus?: boolean;
  purchasePrice: number;
  expectedSalePrice: number;
  supplierId?: string;
  status?: string;
}

/** Update account DTO — partial update */
export interface UpdateAccountDto {
  platform?: string;
  category?: string;
  email?: string;
  password?: string;
  recoveryEmail?: string;
  recoveryPassword?: string;
  username?: string;
  twoFactorStatus?: boolean;
  purchasePrice?: number;
  expectedSalePrice?: number;
  actualSalePrice?: number;
  supplierId?: string;
  status?: string;
  version: number; // Required for optimistic locking
}

/** Account response — returned by the API */
export interface AccountResponseDto {
  id: string;
  internalId: string;
  platform: string;
  category: string;
  email: string;
  password: string; // Decrypted by the service layer
  recoveryEmail: string | null;
  recoveryPassword: string | null; // Decrypted by the service layer
  username: string | null;
  twoFactorStatus: boolean;
  purchasePrice: number;
  expectedSalePrice: number;
  actualSalePrice: number | null;
  status: string;
  version: number;
  supplierId: string | null;
  supplierName: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Account filter query for list endpoint */
export interface AccountFilterQuery extends PaginationQuery {
  status?: string;
  platform?: string;
  category?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

/** Reserve account DTO */
export interface ReserveAccountDto {
  version: number;
  durationMinutes?: number; // Optional auto-release timer
}

/** Sell account DTO */
export interface SellAccountDto {
  version: number;
  actualSalePrice: number;
  buyer?: string;
  marketplace?: string;
}

/** Account status transition for validation */
export type AccountStatusTransition = {
  from: string;
  to: string;
};
