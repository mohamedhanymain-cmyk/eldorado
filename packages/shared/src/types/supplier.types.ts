/** Create supplier DTO */
export interface CreateSupplierDto {
  name: string;
  email?: string;
  trustScore?: number;
  notes?: string;
}

/** Update supplier DTO */
export interface UpdateSupplierDto {
  name?: string;
  email?: string;
  trustScore?: number;
  isBlacklisted?: boolean;
  balance?: number;
  notes?: string;
}

/** Supplier response DTO */
export interface SupplierResponseDto {
  id: string;
  name: string;
  email: string | null;
  trustScore: number;
  isBlacklisted: boolean;
  balance: number;
  notes: string | null;
  accountCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Supplier ledger entry for payment tracking */
export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  amount: number;
  type: "PAYMENT" | "CREDIT" | "DEBIT" | "REFUND";
  description: string;
  createdAt: string;
}
