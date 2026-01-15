// src/pages/fatura/ZReportEntry.tsx
// Summary: Allows manual entry of daily Z reports for demo usage.
// - Prevents crash if company is missing.
// - Persists Z reports to storage and renders a basic list view.
// Integrations:
// - storage.getCompany/getZReports/setZReports
// - UI: Card, Table, Input, Button

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { ZReport } from '@/types'

function safeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function ZReportEntry() {
  const company = storage.getCompany()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [cashTotal, setCashTotal] = useState('')
  const [cardTotal, setCardTotal] = useState('')
  const reports = storage.getZReports()

  if (!company) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Günlük Z Raporu Giriş</h1>
        <p className="text-slate-600">Şirket bulunamadı. Lütfen önce firma kurulumunu tamamlayın.</p>
      </div>
    )
  }

  const handleSubmit = () => {
    const cash = parseFloat(cashTotal) || 0
    const card = parseFloat(cardTotal) || 0
    const total = cash + card

    if (total <= 0) {
      alert('Toplam 0’dan büyük olmalı.')
      return
    }

    const report: ZReport = {
      id: safeId('zr'),
      companyId: company.id,
      date,
      cashTotal: cash,
      cardTotal: card,
      total,
      createdAt: new Date().toISOString(),
    }

    const current = storage.getZReports()
    storage.setZReports([...current, report])

    setCashTotal('')
    setCardTotal('')
    setDate(new Date().toISOString().split('T')[0])
    alert('Z Raporu kaydedildi.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Günlük Z Raporu Giriş</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Z Raporu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tarih</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cash">Nakit Toplam</Label>
              <Input
                id="cash"
                type="number"
                value={cashTotal}
                onChange={(e) => setCashTotal(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Kart Toplam</Label>
              <Input
                id="card"
                type="number"
                value={cardTotal}
                onChange={(e) => setCardTotal(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Kaydet</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Z Raporları Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Nakit</TableHead>
                  <TableHead>Kart</TableHead>
                  <TableHead>Toplam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.date)}</TableCell>
                    <TableCell>{formatCurrency(report.cashTotal)}</TableCell>
                    <TableCell>{formatCurrency(report.cardTotal)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(report.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
