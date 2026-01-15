import { storage } from './storage'
import type {
  Company,
  Invoice,
  IncomingInvoice,
  ZReport,
  Customer,
  Supplier,
  StockItem,
  Expense,
  Service,
  Payment,
  DefterBeyanJob,
} from '@/types'

const COMPANY_ID = 'demo-company-1'

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateDate(daysAgo: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

export function seedDemoData() {
  const company: Company = {
    id: COMPANY_ID,
    name: 'Demo Şirket A.Ş.',
    taxId: '1234567890',
    address: 'İstanbul, Türkiye',
    mode: 'isletme-defteri',
    createdAt: generateDate(30),
  }

  const customers: Customer[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      name: 'ABC Teknoloji Ltd.',
      taxId: '9876543210',
      address: 'Ankara, Türkiye',
      email: 'info@abcteknoloji.com',
      phone: '+90 312 123 4567',
      createdAt: generateDate(25),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      name: 'XYZ Ticaret A.Ş.',
      taxId: '5555555555',
      address: 'İzmir, Türkiye',
      email: 'info@xyztrade.com',
      phone: '+90 232 987 6543',
      createdAt: generateDate(20),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      name: 'DEF Hizmetler Ltd.',
      taxId: '1111111111',
      address: 'Bursa, Türkiye',
      email: 'info@defhizmetler.com',
      phone: '+90 224 555 1234',
      createdAt: generateDate(15),
    },
  ]

  const suppliers: Supplier[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      name: 'Tedarikçi A Ltd.',
      taxId: '2222222222',
      address: 'İstanbul, Türkiye',
      email: 'info@tedarikci-a.com',
      phone: '+90 212 111 2222',
      createdAt: generateDate(20),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      name: 'Tedarikçi B A.Ş.',
      taxId: '3333333333',
      address: 'Ankara, Türkiye',
      email: 'info@tedarikci-b.com',
      phone: '+90 312 333 4444',
      createdAt: generateDate(15),
    },
  ]

  const stockItems: StockItem[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      code: 'STK-001',
      name: 'Ürün A',
      unit: 'Adet',
      stock: 150,
      unitPrice: 100,
      createdAt: generateDate(30),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      code: 'STK-002',
      name: 'Ürün B',
      unit: 'Adet',
      stock: 75,
      unitPrice: 250,
      createdAt: generateDate(30),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      code: 'STK-003',
      name: 'Ürün C',
      unit: 'Kg',
      stock: 500,
      unitPrice: 50,
      createdAt: generateDate(30),
    },
  ]

  const invoices: Invoice[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      invoiceNumber: 'FAT-2024-001',
      customerId: customers[0].id,
      customerName: customers[0].name,
      customerTaxId: customers[0].taxId,
      date: generateDate(5),
      dueDate: generateDate(-20),
      status: 'PDF Oluşturuldu',
      subtotal: 1000,
      vat: 180,
      total: 1180,
      items: [
        {
          id: generateId(),
          description: 'Ürün A',
          quantity: 10,
          unitPrice: 100,
          vatRate: 18,
          total: 1180,
          stockItemId: stockItems[0].id,
        },
      ],
      events: [
        { id: generateId(), timestamp: generateDate(5), status: 'Taslak' },
        { id: generateId(), timestamp: generateDate(4), status: 'Gönderildi' },
        { id: generateId(), timestamp: generateDate(3), status: 'Onaylandı' },
        { id: generateId(), timestamp: generateDate(2), status: 'GİB\'e İletildi' },
        { id: generateId(), timestamp: generateDate(1), status: 'PDF Oluşturuldu' },
      ],
      createdAt: generateDate(5),
      updatedAt: generateDate(1),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      invoiceNumber: 'FAT-2024-002',
      customerId: customers[1].id,
      customerName: customers[1].name,
      customerTaxId: customers[1].taxId,
      date: generateDate(3),
      dueDate: generateDate(-12),
      status: 'Onaylandı',
      subtotal: 2500,
      vat: 450,
      total: 2950,
      items: [
        {
          id: generateId(),
          description: 'Ürün B',
          quantity: 10,
          unitPrice: 250,
          vatRate: 18,
          total: 2950,
          stockItemId: stockItems[1].id,
        },
      ],
      events: [
        { id: generateId(), timestamp: generateDate(3), status: 'Taslak' },
        { id: generateId(), timestamp: generateDate(2), status: 'Gönderildi' },
        { id: generateId(), timestamp: generateDate(1), status: 'Onaylandı' },
      ],
      createdAt: generateDate(3),
      updatedAt: generateDate(1),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      invoiceNumber: 'FAT-2024-003',
      customerId: customers[2].id,
      customerName: customers[2].name,
      customerTaxId: customers[2].taxId,
      date: generateDate(1),
      dueDate: generateDate(-5),
      status: 'Taslak',
      subtotal: 500,
      vat: 90,
      total: 590,
      items: [
        {
          id: generateId(),
          description: 'Ürün C',
          quantity: 10,
          unitPrice: 50,
          vatRate: 18,
          total: 590,
          stockItemId: stockItems[2].id,
        },
      ],
      events: [
        { id: generateId(), timestamp: generateDate(1), status: 'Taslak' },
      ],
      createdAt: generateDate(1),
      updatedAt: generateDate(1),
    },
  ]

  const incomingInvoices: IncomingInvoice[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      invoiceNumber: 'GEL-2024-001',
      supplierId: suppliers[0].id,
      supplierName: suppliers[0].name,
      supplierTaxId: suppliers[0].taxId,
      date: generateDate(4),
      dueDate: generateDate(-11),
      status: 'GİB\'e İletildi',
      subtotal: 2000,
      vat: 360,
      total: 2360,
      items: [
        {
          id: generateId(),
          description: 'Hammadde A',
          quantity: 20,
          unitPrice: 100,
          vatRate: 18,
          total: 2360,
        },
      ],
      events: [
        { id: generateId(), timestamp: generateDate(4), status: 'Gönderildi' },
        { id: generateId(), timestamp: generateDate(3), status: 'Onaylandı' },
        { id: generateId(), timestamp: generateDate(2), status: 'GİB\'e İletildi' },
      ],
      createdAt: generateDate(4),
      updatedAt: generateDate(2),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      invoiceNumber: 'GEL-2024-002',
      supplierId: suppliers[1].id,
      supplierName: suppliers[1].name,
      supplierTaxId: suppliers[1].taxId,
      date: generateDate(2),
      dueDate: generateDate(-8),
      status: 'Onaylandı',
      subtotal: 1500,
      vat: 270,
      total: 1770,
      items: [
        {
          id: generateId(),
          description: 'Hizmet B',
          quantity: 1,
          unitPrice: 1500,
          vatRate: 18,
          total: 1770,
        },
      ],
      events: [
        { id: generateId(), timestamp: generateDate(2), status: 'Gönderildi' },
        { id: generateId(), timestamp: generateDate(1), status: 'Onaylandı' },
      ],
      createdAt: generateDate(2),
      updatedAt: generateDate(1),
    },
  ]

  const zReports: ZReport[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      date: generateDate(1),
      cashTotal: 5000,
      cardTotal: 3000,
      total: 8000,
      createdAt: generateDate(1),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      date: generateDate(2),
      cashTotal: 4500,
      cardTotal: 3500,
      total: 8000,
      createdAt: generateDate(2),
    },
  ]

  const expenses: Expense[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      description: 'Ofis Kirası',
      amount: 5000,
      vatRate: 0,
      vatAmount: 0,
      total: 5000,
      category: 'Kira',
      date: generateDate(10),
      createdAt: generateDate(10),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      description: 'Elektrik Faturası',
      amount: 500,
      vatRate: 20,
      vatAmount: 100,
      total: 600,
      category: 'Faturalar',
      date: generateDate(5),
      createdAt: generateDate(5),
    },
  ]

  const services: Service[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      code: 'SRV-001',
      name: 'Danışmanlık Hizmeti',
      unitPrice: 1000,
      createdAt: generateDate(20),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      code: 'SRV-002',
      name: 'Yazılım Geliştirme',
      unitPrice: 2000,
      createdAt: generateDate(20),
    },
  ]

  const payments: Payment[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      type: 'kasa',
      direction: 'tahsilat',
      amount: 1180,
      description: 'FAT-2024-001 tahsilatı',
      referenceType: 'invoice',
      referenceId: invoices[0].id,
      date: generateDate(1),
      createdAt: generateDate(1),
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      type: 'banka',
      direction: 'odeme',
      amount: 2360,
      description: 'GEL-2024-001 ödemesi',
      referenceType: 'incoming-invoice',
      referenceId: incomingInvoices[0].id,
      date: generateDate(2),
      createdAt: generateDate(2),
    },
  ]

  const defterBeyanJobs: DefterBeyanJob[] = [
    {
      id: generateId(),
      companyId: COMPANY_ID,
      sourceType: 'satis',
      sourceId: invoices[0].id,
      status: 'success',
      attemptCount: 1,
      createdAt: generateDate(1),
      lastRunAt: generateDate(1),
      logs: ['İş kuyruğa alındı', 'GİB\'e gönderildi', 'Başarılı'],
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      sourceType: 'alis',
      sourceId: incomingInvoices[0].id,
      status: 'pending',
      attemptCount: 0,
      createdAt: generateDate(2),
      logs: [],
    },
    {
      id: generateId(),
      companyId: COMPANY_ID,
      sourceType: 'z-raporu',
      sourceId: zReports[0].id,
      status: 'error',
      attemptCount: 2,
      createdAt: generateDate(1),
      lastRunAt: generateDate(0),
      logs: ['İş kuyruğa alındı', 'GİB\'e gönderim hatası', 'Tekrar deneniyor...'],
    },
  ]

  // Save all data
  storage.setCompany(company)
  storage.setCustomers(customers)
  storage.setSuppliers(suppliers)
  storage.setStockItems(stockItems)
  storage.setInvoices(invoices)
  storage.setIncomingInvoices(incomingInvoices)
  storage.setZReports(zReports)
  storage.setExpenses(expenses)
  storage.setServices(services)
  storage.setPayments(payments)
  storage.setDefterBeyanJobs(defterBeyanJobs)
  storage.setLastSync(generateDate(1))
}
