// src/pages/envanter/StockMovements.tsx
// Summary: Displays stock movement history from localStorage (demo).
// - Reads movements, stock items, and invoices from storage.
// - Renders movement type badges and reference labels.
// - Sorts movements by date descending for better demo readability.
// Integrations:
// - storage.getStockMovements/getStockItems/getInvoices
// - formatDate helper for date rendering.

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { Badge } from '@/components/ui/badge'
import type { StockMovement } from '@/types'

export function StockMovements() {
  const movements = storage.getStockMovements()
  const stockItems = storage.getStockItems()
  const invoices = storage.getInvoices()

  const getStockItemName = (id: string) => {
    return stockItems.find((s) => s.id === id)?.name || 'Bilinmeyen'
  }

  const getReferenceInfo = (type: string, id: string) => {
    // Keep reference labels human-friendly for the demo.
    if (type === 'invoice') {
      const inv = invoices.find((i) => i.id === id)
      return inv ? `Fatura: ${inv.invoiceNumber}` : `Fatura: ${id}`
    }
    return `${type}: ${id}`
  }

  const sortedMovements = useMemo(() => {
    // Show newest items first for a more "live" feel in demos.
    const list: StockMovement[] = [...movements]
    list.sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return db - da
    })
    return list
  }, [movements])

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
                {sortedMovements.map((movement) => (
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

          {sortedMovements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Henüz stok hareketi yok.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
