// src/pages/envanter/StockMovements.tsx
// Summary: Lists inventory movements (in/out) for the active company.
// - Shows movement reference for sales invoices and incoming invoices.
// Integrations:
// - storage.getCompany/getStockMovements/getStockItems/getInvoices/getIncomingInvoices
// - formatDate helper for date display.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { Badge } from '@/components/ui/badge'

export function StockMovements() {
  const company = storage.getCompany()
  const movementsAll = storage.getStockMovements()
  const stockItemsAll = storage.getStockItems()
  const invoicesAll = storage.getInvoices()
  const incomingInvoicesAll = storage.getIncomingInvoices()

  if (!company) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Stok Hareketleri</h1>
        <p className="text-slate-600">Şirket bilgisi bulunamadı. Lütfen önce firma kurulumunu tamamlayın.</p>
      </div>
    )
  }

  const movements = movementsAll.filter((m) => m.companyId === company.id)
  const stockItems = stockItemsAll.filter((s) => s.companyId === company.id)
  const invoices = invoicesAll.filter((i) => i.companyId === company.id)
  const incomingInvoices = incomingInvoicesAll.filter((i) => i.companyId === company.id)

  const getStockItemName = (id: string) => {
    return stockItems.find((s) => s.id === id)?.name || 'Bilinmeyen'
  }

  const getReferenceInfo = (type: string, id: string) => {
    if (type === 'invoice') {
      const inv = invoices.find((i) => i.id === id)
      return inv ? `Fatura: ${inv.invoiceNumber}` : id
    }

    // Backward compatible: some data may use 'purchase' for incoming invoices.
    if (type === 'purchase' || type === 'incoming-invoice') {
      const inv = incomingInvoices.find((i) => i.id === id)
      return inv ? `Gelen Fatura: ${inv.invoiceNumber}` : id
    }

    return `${type}: ${id}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stok Hareketleri</h1>
        <p className="text-slate-600 mt-2">Tüm stok giriş ve çıkış hareketleri</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hareketler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Stok Kartı</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Referans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{formatDate(movement.date)}</TableCell>
                    <TableCell>{getStockItemName(movement.stockItemId)}</TableCell>
                    <TableCell>
                      <Badge className={movement.type === 'in' ? 'bg-green-500' : 'bg-red-500'}>
                        {movement.type === 'in' ? 'Giriş' : 'Çıkış'}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{getReferenceInfo(movement.referenceType, movement.referenceId)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {movements.length === 0 && <div className="text-center py-8 text-muted-foreground">Henüz stok hareketi yok.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
