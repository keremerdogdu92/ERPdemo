import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { IncomingInvoice } from '@/types'
import { RefreshCw } from 'lucide-react'

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function IncomingInvoices() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(storage.getLastSync())
  const invoices = storage.getIncomingInvoices()

  const simulateSync = async () => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const suppliers = storage.getSuppliers()
    if (suppliers.length === 0) {
      setIsLoading(false)
      return
    }

    const newInvoice: IncomingInvoice = {
      id: generateId(),
      companyId: storage.getCompany()!.id,
      invoiceNumber: `GEL-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      supplierId: suppliers[Math.floor(Math.random() * suppliers.length)].id,
      supplierName: suppliers[Math.floor(Math.random() * suppliers.length)].name,
      supplierTaxId: suppliers[Math.floor(Math.random() * suppliers.length)].taxId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Gönderildi',
      subtotal: Math.floor(Math.random() * 5000) + 1000,
      vat: 0,
      total: 0,
      items: [
        {
          id: generateId(),
          description: 'Otomatik senkronize edilen fatura',
          quantity: 1,
          unitPrice: Math.floor(Math.random() * 5000) + 1000,
          vatRate: 18,
          total: 0,
        },
      ],
      events: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          status: 'Gönderildi',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    newInvoice.vat = newInvoice.subtotal * 0.18
    newInvoice.total = newInvoice.subtotal + newInvoice.vat
    newInvoice.items[0].total = newInvoice.total

    const updatedInvoices = [...invoices, newInvoice]
    storage.setIncomingInvoices(updatedInvoices)
    storage.setLastSync(new Date().toISOString())
    setLastSync(new Date().toISOString())
    setIsLoading(false)
  }

  useEffect(() => {
    // Auto-sync on page load
    simulateSync()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gelen Faturalar</h1>
          <p className="text-slate-600 mt-2">Otomatik senkronize edilen gelen faturalar</p>
        </div>
        <div className="flex items-center gap-4">
          {lastSync && (
            <p className="text-sm text-muted-foreground">
              Son Senkron: {formatDateTime(lastSync)}
            </p>
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
                    <TableCell>{formatDateTime(invoice.date)}</TableCell>
                    <TableCell>{formatDateTime(invoice.dueDate)}</TableCell>
                    <TableCell>
                      <Badge>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/gelen-fatura/${invoice.id}`)}
                      >
                        Detay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {invoices.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz gelen fatura yok.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
