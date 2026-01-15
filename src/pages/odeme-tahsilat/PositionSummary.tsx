// src/pages/odeme-tahsilat/PositionSummary.tsx
// Summary: Shows cash/bank/cheque/note positions for the demo.
// - Calculates totals for collections (tahsilat) and payments (odeme) per type.
// - Displays a "Recent Transactions" table for demo Q&A.
// Integrations:
// - storage.getPayments
// - formatCurrency helper

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { Payment, PaymentType } from '@/types'

export function PositionSummary() {
  const payments = storage.getPayments()

  const types: PaymentType[] = ['kasa', 'banka', 'cek', 'senet']
  const typeLabels: Record<PaymentType, string> = {
    kasa: 'Kasa',
    banka: 'Banka',
    cek: 'Çek',
    senet: 'Senet',
  }

  const calculate = (type: PaymentType, direction: 'tahsilat' | 'odeme') => {
    return payments
      .filter((p) => p.type === type && p.direction === direction)
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  const rows = useMemo(() => {
    return types.map((type) => {
      const tahsilat = calculate(type, 'tahsilat')
      const odeme = calculate(type, 'odeme')
      const net = tahsilat - odeme
      return { type, tahsilat, odeme, net }
    })
  }, [payments])

  const recent = useMemo(() => {
    // Newest first, capped for clean demo UX.
    return [...payments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  }, [payments])

  const directionLabel = (p: Payment) => (p.direction === 'tahsilat' ? 'Tahsilat' : 'Ödeme')
  const refLabel = (p: Payment) => {
    if (p.referenceType === 'manual') return 'Manuel'
    if (p.referenceType === 'invoice') return 'Satış Faturası'
    if (p.referenceType === 'incoming-invoice') return 'Gelen Fatura'
    return p.referenceType
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pozisyon Özeti</h1>
        <p className="text-slate-600 mt-2">Kasa, Banka, Çek ve Senet pozisyonları</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pozisyon Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tip</TableHead>
                  <TableHead>Tahsilat (Alacak)</TableHead>
                  <TableHead>Ödeme (Borç)</TableHead>
                  <TableHead>Net Pozisyon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.type}>
                    <TableCell className="font-medium">{typeLabels[r.type]}</TableCell>
                    <TableCell className="text-green-600">{formatCurrency(r.tahsilat)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrency(r.odeme)}</TableCell>
                    <TableCell className={`font-medium ${r.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(r.net)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Henüz ödeme/tahsilat kaydı yok.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Referans</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.date)}</TableCell>
                    <TableCell className={p.direction === 'tahsilat' ? 'text-green-600' : 'text-red-600'}>
                      {directionLabel(p)}
                    </TableCell>
                    <TableCell>{typeLabels[p.type]}</TableCell>
                    <TableCell>{refLabel(p)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {recent.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Gösterilecek işlem yok.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
