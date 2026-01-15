import { useState } from 'react'
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

export function NewInvoice() {
  const navigate = useNavigate()
  const company = storage.getCompany()!
  const customers = storage.getCustomers()
  const stockItems = storage.getStockItems()

  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<InvoiceLineItem[]>([])

  const addItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 18,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const updateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice' || field === 'vatRate') {
            const subtotal = updated.quantity * updated.unitPrice
            updated.total = subtotal * (1 + updated.vatRate / 100)
          }
          return updated
        }
        return item
      })
    )
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const vat = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100),
    0
  )
  const total = subtotal + vat

  const handleSubmit = () => {
    if (!customerId || items.length === 0) {
      alert('Lütfen müşteri seçin ve en az bir kalem ekleyin.')
      return
    }

    const customer = customers.find((c) => c.id === customerId)
    if (!customer) return

    const invoiceNumber = `FAT-${new Date().getFullYear()}-${String(
      storage.getInvoices().length + 1
    ).padStart(3, '0')}`

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
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
      items,
      events: [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'Taslak',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const invoices = storage.getInvoices()
    storage.setInvoices([...invoices, invoice])

    // Update stock and create movements if applicable
    const movements = storage.getStockMovements()
    items.forEach((item) => {
      if (item.stockItemId) {
        const stockItem = stockItems.find((s) => s.id === item.stockItemId)
        if (stockItem) {
          stockItem.stock -= item.quantity
          storage.setStockItems([...stockItems])
          
          // Create stock movement
          movements.push({
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            companyId: company.id,
            stockItemId: item.stockItemId,
            type: 'out',
            quantity: item.quantity,
            referenceType: 'invoice',
            referenceId: invoice.id,
            date: date,
            createdAt: new Date().toISOString(),
          })
        }
      }
    })
    if (movements.length > 0) {
      storage.setStockMovements(movements)
    }

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
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fatura Tarihi</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Vade Tarihi</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
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
                    <TableCell>
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
                        onChange={(e) =>
                          updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.vatRate}
                        onChange={(e) => updateItem(item.id, 'vatRate', parseFloat(e.target.value))}
                        className="w-24"
                      >
                        <option value="0">0%</option>
                        <option value="1">1%</option>
                        <option value="10">10%</option>
                        <option value="20">20%</option>
                      </Select>
                    </TableCell>
                    <TableCell>{formatCurrency(item.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
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
