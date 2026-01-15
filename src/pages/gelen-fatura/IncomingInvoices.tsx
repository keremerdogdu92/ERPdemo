// src/pages/gelen-fatura/IncomingInvoices.tsx
// Summary: Demo "incoming invoices sync" page.
// - Simulates fetching incoming invoices and persists them to localStorage via storage.ts.
// - Tracks last sync timestamp and exposes a manual "run sync" action.
// - Uses local React state for invoices so the UI updates immediately after persisting.
// Integrations:
// - storage.getCompany/getSuppliers/getIncomingInvoices/getLastSync
// - storage.setIncomingInvoices/setLastSync
// - formatCurrency/formatDate/formatDateTime helpers
//
// Notes (demo-hardening):
// - Guards against missing company (prevents hard crash).
// - Uses crypto.randomUUID when available for safer IDs.
// - Ensures supplier fields come from the SAME selected supplier (prevents mismatched supplierId/name/taxId).
// - Prevents concurrent sync runs.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { IncomingInvoice } from '@/types'
import { RefreshCw } from 'lucide-react'

function safeId(prefix: string) {
  // Prefer cryptographically strong UUID when available (modern browsers).
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  // Fallback for older environments.
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function IncomingInvoices() {
  const navigate = useNavigate()
  const company = storage.getCompany()

  // Demo safety: avoid hard crash if setup is incomplete.
  if (!company) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Gelen Faturalar</h1>
        <p className="text-slate-600">Şirket bilgisi bulunamadı. Lütfen önce firma kurulumunu tamamlayın.</p>
        <Button onClick={() => navigate('/setup')}>Kuruluma Git</Button>
      </div>
    )
  }

  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(() => storage.getLastSync())
  const [invoices, setInvoices] = useState<IncomingInvoice[]>(() => storage.getIncomingInvoices())

  const suppliers = useMemo(() => storage.getSuppliers(), [])
  const nextInvoiceNumber = useMemo(() => {
    const year = new Date().getFullYear()
    return `GEL-${year}-${String(invoices.length + 1).padStart(3, '0')}`
  }, [invoices.length])

  const simulateSync = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 900))

      if (suppliers.length === 0) {
        alert('Tedarikçi bulunamadı. Lütfen önce tedarikçi ekleyin.')
        return
      }

      // IMPORTANT: pick supplier once to avoid inconsistent supplierId/name/taxId.
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]

      // Demo financials (simple + deterministic enough for UX).
      const subtotal = Math.floor(Math.random() * 5000) + 1000
      const vatRate = 18
      const vat = subtotal * (vatRate / 100)
      const total = subtotal + vat

      const nowIso = new Date().toISOString()
      const invoiceId = safeId('incinv')

      const newInvoice: IncomingInvoice = {
        id: invoiceId,
        companyId: company.id,
        invoiceNumber: nextInvoiceNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierTaxId: supplier.taxId,
        date: todayISO(),
        dueDate: addDaysISO(30),
        status: 'Gönderildi',
        subtotal,
        vat,
        total,
        items: [
          {
            id: safeId('item'),
            description: 'Otomatik senkronize edilen fatura',
            quantity: 1,
            unitPrice: subtotal,
            vatRate,
            total,
          },
        ],
        events: [
          {
            id: safeId('evt'),
            timestamp: nowIso,
            status: 'Gönderildi',
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      }

      const current = storage.getIncomingInvoices()
      const updated = [...current, newInvoice]

      storage.setIncomingInvoices(updated)
      storage.setLastSync(nowIso)

      setInvoices(updated)
      setLastSync(nowIso)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Demo: auto-sync on first load (keeps the screen non-empty).
    // If you want a "manual only" demo, remove this call.
    simulateSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gelen Faturalar</h1>
          <p className="text-slate-600 mt-2">Demo senkronizasyonu ile oluşan gelen faturalar</p>
        </div>
        <div className="flex items-center gap-4">
          {lastSync && (
            <p className="text-sm text-muted-foreground">Son Senkron: {formatDateTime(lastSync)}</p>
          )}
          <Button onClick={simulateSync} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Senkronu Şimdi Çalıştır
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Senkronizasyon yapılıyor...</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gelen Faturalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Tedarikçi</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Vade</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.supplierName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      <Badge>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/gelen-fatura/${invoice.id}`)}>
                        Detay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {invoices.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">Henüz gelen fatura yok.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
