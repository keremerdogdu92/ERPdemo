import type {
  Company,
  Invoice,
  IncomingInvoice,
  ZReport,
  Customer,
  Supplier,
  StockItem,
  StockMovement,
  Expense,
  Service,
  Payment,
  AccountingVoucher,
  DefterBeyanJob,
  UserRole,
} from '@/types'

const STORAGE_KEYS = {
  COMPANY: 'qnowa_company',
  ROLE: 'qnowa_role',
  INVOICES: 'qnowa_invoices',
  INCOMING_INVOICES: 'qnowa_incoming_invoices',
  Z_REPORTS: 'qnowa_z_reports',
  CUSTOMERS: 'qnowa_customers',
  SUPPLIERS: 'qnowa_suppliers',
  STOCK_ITEMS: 'qnowa_stock_items',
  STOCK_MOVEMENTS: 'qnowa_stock_movements',
  EXPENSES: 'qnowa_expenses',
  SERVICES: 'qnowa_services',
  PAYMENTS: 'qnowa_payments',
  VOUCHERS: 'qnowa_vouchers',
  DEFTER_BEYAN_JOBS: 'qnowa_defter_beyan_jobs',
  LAST_SYNC: 'qnowa_last_sync',
}

class Storage {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage error:', e)
    }
  }

  // Company
  getCompany(): Company | null {
    return this.get<Company | null>(STORAGE_KEYS.COMPANY, null)
  }

  setCompany(company: Company): void {
    this.set(STORAGE_KEYS.COMPANY, company)
  }

  // Role
  getRole(): UserRole {
    return this.get<UserRole>(STORAGE_KEYS.ROLE, 'mukellef')
  }

  setRole(role: UserRole): void {
    this.set(STORAGE_KEYS.ROLE, role)
  }

  // Invoices
  getInvoices(): Invoice[] {
    return this.get<Invoice[]>(STORAGE_KEYS.INVOICES, [])
  }

  setInvoices(invoices: Invoice[]): void {
    this.set(STORAGE_KEYS.INVOICES, invoices)
  }

  // Incoming Invoices
  getIncomingInvoices(): IncomingInvoice[] {
    return this.get<IncomingInvoice[]>(STORAGE_KEYS.INCOMING_INVOICES, [])
  }

  setIncomingInvoices(invoices: IncomingInvoice[]): void {
    this.set(STORAGE_KEYS.INCOMING_INVOICES, invoices)
  }

  // Z Reports
  getZReports(): ZReport[] {
    return this.get<ZReport[]>(STORAGE_KEYS.Z_REPORTS, [])
  }

  setZReports(reports: ZReport[]): void {
    this.set(STORAGE_KEYS.Z_REPORTS, reports)
  }

  // Customers
  getCustomers(): Customer[] {
    return this.get<Customer[]>(STORAGE_KEYS.CUSTOMERS, [])
  }

  setCustomers(customers: Customer[]): void {
    this.set(STORAGE_KEYS.CUSTOMERS, customers)
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.get<Supplier[]>(STORAGE_KEYS.SUPPLIERS, [])
  }

  setSuppliers(suppliers: Supplier[]): void {
    this.set(STORAGE_KEYS.SUPPLIERS, suppliers)
  }

  // Stock Items
  getStockItems(): StockItem[] {
    return this.get<StockItem[]>(STORAGE_KEYS.STOCK_ITEMS, [])
  }

  setStockItems(items: StockItem[]): void {
    this.set(STORAGE_KEYS.STOCK_ITEMS, items)
  }

  // Stock Movements
  getStockMovements(): StockMovement[] {
    return this.get<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, [])
  }

  setStockMovements(movements: StockMovement[]): void {
    this.set(STORAGE_KEYS.STOCK_MOVEMENTS, movements)
  }

  // Expenses
  getExpenses(): Expense[] {
    return this.get<Expense[]>(STORAGE_KEYS.EXPENSES, [])
  }

  setExpenses(expenses: Expense[]): void {
    this.set(STORAGE_KEYS.EXPENSES, expenses)
  }

  // Services
  getServices(): Service[] {
    return this.get<Service[]>(STORAGE_KEYS.SERVICES, [])
  }

  setServices(services: Service[]): void {
    this.set(STORAGE_KEYS.SERVICES, services)
  }

  // Payments
  getPayments(): Payment[] {
    return this.get<Payment[]>(STORAGE_KEYS.PAYMENTS, [])
  }

  setPayments(payments: Payment[]): void {
    this.set(STORAGE_KEYS.PAYMENTS, payments)
  }

  // Vouchers
  getVouchers(): AccountingVoucher[] {
    return this.get<AccountingVoucher[]>(STORAGE_KEYS.VOUCHERS, [])
  }

  setVouchers(vouchers: AccountingVoucher[]): void {
    this.set(STORAGE_KEYS.VOUCHERS, vouchers)
  }

  // Defter Beyan Jobs
  getDefterBeyanJobs(): DefterBeyanJob[] {
    return this.get<DefterBeyanJob[]>(STORAGE_KEYS.DEFTER_BEYAN_JOBS, [])
  }

  setDefterBeyanJobs(jobs: DefterBeyanJob[]): void {
    this.set(STORAGE_KEYS.DEFTER_BEYAN_JOBS, jobs)
  }

  // Last Sync
  getLastSync(): string | null {
    return this.get<string | null>(STORAGE_KEYS.LAST_SYNC, null)
  }

  setLastSync(date: string): void {
    this.set(STORAGE_KEYS.LAST_SYNC, date)
  }

  // Clear all
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

export const storage = new Storage()
