// src/types/index.ts
// Summary: Shared type definitions for the ERP demo.
// Integrations:
// - Used across pages and storage layer to keep localStorage data consistent.
// Notes:
// - StockMovement.referenceType supports both 'purchase' (legacy) and 'incoming-invoice' (canonical).

export type CompanyMode = 'isletme-defteri' | 'genel-muhasebe'
export type UserRole = 'mukellef' | 'mali-musavir'

export interface Company {
  id: string
  name: string
  taxId: string
  address: string
  mode: CompanyMode
  createdAt: string
}

export type InvoiceStatus =
  | 'Taslak'
  | 'Gönderildi'
  | 'Onaylandı'
  | "GİB'e İletildi"
  | 'PDF Oluşturuldu'
  | 'İptal'
  | 'İade'

export interface InvoiceEvent {
  id: string
  timestamp: string
  status: InvoiceStatus
  userId?: string
  note?: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  total: number
  stockItemId?: string
}

export interface Invoice {
  id: string
  companyId: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerTaxId: string
  date: string
  dueDate: string
  status: InvoiceStatus
  subtotal: number
  vat: number
  total: number
  items: InvoiceLineItem[]
  events: InvoiceEvent[]
  createdAt: string
  updatedAt: string
}

export interface IncomingInvoice {
  id: string
  companyId: string
  invoiceNumber: string
  supplierId: string
  supplierName: string
  supplierTaxId: string
  date: string
  dueDate: string
  status: InvoiceStatus
  subtotal: number
  vat: number
  total: number
  items: InvoiceLineItem[]
  events: InvoiceEvent[]
  createdAt: string
  updatedAt: string
}

export interface ZReport {
  id: string
  companyId: string
  date: string
  cashTotal: number
  cardTotal: number
  total: number
  createdAt: string
}

export interface Customer {
  id: string
  companyId: string
  name: string
  taxId: string
  address: string
  email?: string
  phone?: string
  createdAt: string
}

export interface Supplier {
  id: string
  companyId: string
  name: string
  taxId: string
  address: string
  email?: string
  phone?: string
  createdAt: string
}

export interface StockItem {
  id: string
  companyId: string
  code: string
  name: string
  unit: string
  stock: number
  unitPrice: number
  createdAt: string
}

export type StockMovementReferenceType = 'invoice' | 'purchase' | 'incoming-invoice' | 'manual'

export interface StockMovement {
  id: string
  companyId: string
  stockItemId: string
  type: 'in' | 'out'
  quantity: number
  referenceType: StockMovementReferenceType
  referenceId: string
  date: string
  createdAt: string
}

export interface Expense {
  id: string
  companyId: string
  description: string
  amount: number
  vatRate: number
  vatAmount: number
  total: number
  category: string
  date: string
  createdAt: string
}

export interface Service {
  id: string
  companyId: string
  code: string
  name: string
  unitPrice: number
  createdAt: string
}

export type PaymentType = 'kasa' | 'banka' | 'cek' | 'senet'
export type PaymentDirection = 'tahsilat' | 'odeme'
export type PaymentReferenceType = 'invoice' | 'incoming-invoice' | 'manual'

export interface Payment {
  id: string
  companyId: string
  type: PaymentType
  direction: PaymentDirection
  amount: number
  description: string
  referenceType: PaymentReferenceType
  referenceId?: string
  date: string
  createdAt: string
}

export interface AccountingVoucher {
  id: string
  companyId: string
  voucherNumber: string
  sourceType: 'satis-faturasi' | 'alis-faturasi' | 'okc-fisi' | 'z-raporu'
  sourceId: string
  date: string
  entries: AccountingEntry[]
  createdAt: string
}

export interface AccountingEntry {
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description: string
}

export interface DefterBeyanJob {
  id: string
  companyId: string
  sourceType: 'satis' | 'alis' | 'gider' | 'z-raporu' | 'okc'
  sourceId: string
  status: 'pending' | 'processing' | 'success' | 'error'
  attemptCount: number
  createdAt: string
  lastRunAt?: string
  logs: string[]
}
