import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import type { AccountingVoucher } from '@/types'

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateVoucher(reportId: string, companyMode: string): AccountingVoucher {
  const reports = storage.getZReports()
  const report = reports.find((r) => r.id === reportId)
  if (!report) throw new Error('Report not found')

  const voucherNumber = `FİŞ-${new Date().getFullYear()}-${String(
    storage.getVouchers().length + 1
  ).padStart(3, '0')}`

  if (companyMode === 'isletme-defteri') {
    return {
      id: generateId(),
      companyId: storage.getCompany()!.id,
      voucherNumber,
      sourceType: 'z-raporu',
      sourceId: report.id,
      date: report.date,
      entries: [
        {
          accountCode: '100',
          accountName: 'Kasa',
          debit: report.total,
          credit: 0,
          description: `Z Raporu - ${formatDate(report.date)}`,
        },
        {
          accountCode: '600',
          accountName: 'Gelir',
          debit: 0,
          credit: report.total,
          description: `Günlük satış`,
        },
      ],
      createdAt: new Date().toISOString(),
    }
  } else {
    return {
      id: generateId(),
      companyId: storage.getCompany()!.id,
      voucherNumber,
      sourceType: 'z-raporu',
      sourceId: report.id,
      date: report.date,
      entries: [
        {
          accountCode: '100',
          accountName: 'Kasa',
          debit: report.total,
          credit: 0,
          description: `Z Raporu`,
        },
        {
          accountCode: '600',
          accountName: 'Gelir',
          debit: 0,
          credit: report.total,
          description: `Günlük satış`,
        },
      ],
      createdAt: new Date().toISOString(),
    }
  }
}

export function AccountingZReport() {
  const reports = storage.getZReports()
  const vouchers = storage.getVouchers()
  const company = storage.getCompany()!
  const [voucherPreview, setVoucherPreview] = useState<AccountingVoucher | null>(null)

  const reportsWithVouchers = reports.map((report) => {
    const voucher = vouchers.find((v) => v.sourceId === report.id && v.sourceType === 'z-raporu')
    return { report, voucher }
  })

  const handleGenerateVoucher = (reportId: string) => {
    const voucher = generateVoucher(reportId, company.mode)
    setVoucherPreview(voucher)
  }

  const handleConfirmVoucher = () => {
    if (voucherPreview) {
      const vouchers = storage.getVouchers()
      storage.setVouchers([...vouchers, voucherPreview])
      setVoucherPreview(null)
      alert('Fiş oluşturuldu.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Z Raporları</h1>
        <p className="text-slate-600 mt-2">Z raporlarından muhasebe fişi oluşturun</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Z Raporları</CardTitle>
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
                  <TableHead>Durum</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportsWithVouchers.map(({ report, voucher }) => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.date)}</TableCell>
                    <TableCell>{formatCurrency(report.cashTotal)}</TableCell>
                    <TableCell>{formatCurrency(report.cardTotal)}</TableCell>
                    <TableCell>{formatCurrency(report.total)}</TableCell>
                    <TableCell>
                      {voucher ? (
                        <Badge className="bg-green-500">Fiş Üretildi</Badge>
                      ) : (
                        <Badge className="bg-gray-500">Fiş Bekliyor</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!voucher && (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateVoucher(report.id)}
                        >
                          Fiş Üret
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {voucherPreview && (
        <Dialog open={!!voucherPreview} onOpenChange={() => setVoucherPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Muhasebe Fişi Önizleme</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Fiş No</p>
                <p className="font-medium">{voucherPreview.voucherNumber}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hesap</TableHead>
                    <TableHead>Borç</TableHead>
                    <TableHead>Alacak</TableHead>
                    <TableHead>Açıklama</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voucherPreview.entries.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {entry.accountCode} - {entry.accountName}
                      </TableCell>
                      <TableCell>{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                      <TableCell>{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setVoucherPreview(null)}>
                  İptal
                </Button>
                <Button onClick={handleConfirmVoucher}>Onayla ve Kaydet</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
