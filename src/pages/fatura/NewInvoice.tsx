// src/pages/fatura/NewInvoice.tsx
// Summary: Creates a new sales invoice and persists it to localStorage via storage.ts.
// - Captures invoice header (customer, dates) and line items.
// - Computes subtotal/VAT/total.
// - Persists invoice with an initial audit event ("Taslak").
// - Updates stock levels and creates stock movements when stockItemId is provided.
// Integrations:
// - storage.getCompany/getCustomers/getStockItems/getInvoices/getStockMovements
// - storage.setInvoices/setStockItems/setStockMovements
// - Navigates to invoice detail after save.
//
// Notes (Demo correctness / consistency):
// - Transactional behavior: if stock is insufficient, invoice is NOT saved.
// - Recomputes line totals whenever relevant fields change (including stock item auto-fill).

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { Invoice, InvoiceLineItem } from '@/types'
import { Plus, Trash2 } from 'lucide-react'

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

function computeLineTotal(quantity: number, unitPrice: number, vatRate: number): number {
  const qty = Number(quantity) || 0
  const price = Number(unitPrice) || 0
  const vr = Number(vatRate) || 0
  const subtotalLine = qty * price
  return subtotalLine * (1 + vr / 100)
}

function normalizeItems(items: InvoiceLineItem[]): InvoiceLineItem[] {
  return items.map((i) => ({
    ...i,
    quantity: Number(i.quantity) || 0,
    unitPrice: Number(i.unitPrice) || 0,
    vatRate: Number(i.vatRate) || 0,
    total: computeLineTotal(i.quantity, i.unitPrice, i.vatRate),
  }))
}

export function NewInvoice() {
  const navigate = useNavigate()
  const company = storage.getCompany()

  // In demo mode, we assume company setup exists. Still guard to avoid hard crash.
  if (!company) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Yeni Fatura Oluştur</h1>
        <p className="text-slate-600">Şirket bilgisi bulunamadı. Lütfen önce firma kurulumunu tamamlayın.</p>
        <Button onClick={() => navigate('/ayarlar')}>Ayarlar&apos;a Git</Button>
      </div>
    )
  }

  const customersAll = storage.getCustomers()
  const stockItemsAll = storage.getStockItems()

  // Company scoping for safety if the demo grows to multi-company.
  const customers = customersAll.filter((c) => c.companyId === company.id)
  const stockItems = stockItemsAll.filter((s) => s.companyId === company.id)

  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(todayISO())
  const [dueDate, setDueDate] = useState(todayISO())
  const [items, setItems] = useState<InvoiceLineItem[]>([])

  const addItem = () => {
    const newItem: InvoiceLineItem = {
      id: safeId('item'),
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 18,
      total: computeLineTotal(1, 0, 18),
    }
    setItems((prev) => [...prev, newItem])
  }

  const updateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        const updated: InvoiceLineItem = { ...item, [field]: value }

        // If a stock item was selected, optionally auto-fill description/unit price if empty/zero.
        if (field === 'stockItemId') {
          const s = stockItems.find((x) => x.id === value)
          if (s) {
            if (!updated.description) updated.description = s.name
            if (!updated.unitPrice || updated.unitPrice === 0) updated.unitPrice = s.unitPrice
          }
        }

        // Always recompute total after any update that could influence it.
        // This avoids edge cases where stock selection auto-fills unitPrice but total stays stale.
        updated.total = computeLineTotal(updated.quantity, updated.unitPrice, updated.vatRate)

        return updated
      })
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const normalizedItems = useMemo(() => normalizeItems(items), [items])

  const subtotal = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [normalizedItems]
  )
  const vat = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100), 0),
    [normalizedItems]
  )
  const total = subtotal + vat

  const handleSubmit = () => {
    if (!customerId || normalizedItems.length === 0) {
      alert('Lütfen müşteri seçin ve en az bir kalem ekleyin.')
      return
    }

    const customer = customers.find((c) => c.id === customerId)
    if (!customer) {
      alert('Seçilen müşteri bulunamadı.')
      return
    }

    // Basic line validation for demo realism.
    const hasInvalidLine = normalizedItems.some((i) => !i.description || i.quantity <= 0 || i.unitPrice < 0)
    if (hasInvalidLine) {
      alert('Lütfen kalem açıklaması girin; miktar 0’dan büyük olmalı ve fiyat negatif olmamalı.')
      return
    }

    const invoicesAll = storage.getInvoices()
    const invoices = invoicesAll.filter((inv) => inv.companyId === company.id)
    const invoiceNumber = `FAT-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`

    const invoiceId = safeId('inv')
    const nowIso = new Date().toISOString()

    // Prepare stock changes first (transactional).
    const originalStockItemsAll = storage.getStockItems()
    const updatedStockItemsAll = originalStockItemsAll.map((s) => ({ ...s }))
    const movements = storage.getStockMovements().slice()

    for (const line of normalizedItems) {
      if (!line.stockItemId) continue

      const stock = updatedStockItemsAll.find((s) => s.id === line.stockItemId && s.companyId === company.id)
      if (!stock) continue

      const nextStock = stock.stock - line.quantity
      if (nextStock < 0) {
        alert(`Stok yetersiz: "${stock.name}" için mevcut stok ${stock.stock}, çıkış ${line.quantity}.`)
        return
      }

      stock.stock = nextStock

      movements.push({
        id: safeId('mov'),
        companyId: company.id,
        stockItemId: line.stockItemId,
        type: 'out',
        quantity: line.quantity,
        referenceType: 'invoice',
        referenceId: invoiceId,
        date,
        createdAt: nowIso,
      })
    }

    // If we reached here, stock is valid. Now persist everything.
    const invoice: Invoice = {
      id: invoiceId,
      companyId: company.id,
      invoiceNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerTaxId: customer.taxId,
      date,
      dueDate,
      status: 'Taslak',
      subtotal,
      vat,
      total,
      items: normalizedItems,
      events: [
        {
          id: safeId('evt'),
          timestamp: nowIso,
          status: 'Taslak',
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    storage.setInvoices([...invoicesAll, invoice])
    storage.setStockItems(updatedStockItemsAll)
    storage.setStockMovements(movements)

    navigate(`/fatura/${invoice.id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yeni Fatura Oluştur</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fatura Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Müşteri</Label>
              <Select id="customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Seçiniz...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fatura Tarihi</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Vade Tarihi</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fatura Kalemleri</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Kalem Ekle
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stok/Hizmet</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Birim Fiyat</TableHead>
                  <TableHead>KDV %</TableHead>
                  <TableHead>Toplam</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-[220px]">
                      <Select
                        value={item.stockItemId ?? ''}
                        onChange={(e) => updateItem(item.id, 'stockItemId', e.target.value || undefined)}
                      >
                        <option value="">(Opsiyonel) Stok seç...</option>
                        {stockItems.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} - {s.name} (Stok: {s.stock})
                          </option>
                        ))}
                      </Select>
                    </TableCell>

                    <TableCell className="min-w-[220px]">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Açıklama"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                    </TableCell>

                    <TableCell>
                      <Select
                        value={String(item.vatRate)}
                        onChange={(e) => updateItem(item.id, 'vatRate', parseFloat(e.target.value))}
                        className="w-24"
                      >
                        <option value="0">0%</option>
                        <option value="1">1%</option>
                        <option value="8">8%</option>
                        <option value="10">10%</option>
                        <option value="18">18%</option>
                        <option value="20">20%</option>
                      </Select>
                    </TableCell>

                    <TableCell>{formatCurrency(computeLineTotal(item.quantity, item.unitPrice, item.vatRate))}</TableCell>

                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz kalem eklenmedi. Lütfen kalem ekleyin.
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="space-y-2 w-64">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV:</span>
                  <span>{formatCurrency(vat)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Genel Toplam:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/fatura/satis')}>
          İptal
        </Button>
        <Button onClick={handleSubmit}>Faturayı Kaydet</Button>
      </div>
    </div>
  )
}
