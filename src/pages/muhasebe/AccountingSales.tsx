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

function generateVoucher(invoiceId: string, companyMode: string): AccountingVoucher {
  const invoices = storage.getInvoices()
  const invoice = invoices.find((inv) => inv.id === invoiceId)
  if (!invoice) throw new Error('Invoice not found')

  const voucherNumber = `FİŞ-${new Date().getFullYear()}-${String(
    storage.getVouchers().length + 1
  ).padStart(3, '0')}`

  if (companyMode === 'isletme-defteri') {
    return {
      id: generateId(),
      companyId: storage.getCompany()!.id,
      voucherNumber,
      sourceType: 'satis-faturasi',
      sourceId: invoice.id,
      date: invoice.date,
      entries: [
        {
          accountCode: '600',
          accountName: 'Gelir',
          debit: 0,
          credit: invoice.subtotal,
          description: `Satış geliri - ${invoice.invoiceNumber}`,
        },
        {
          accountCode: '191',
          accountName: 'KDV',
          debit: 0,
          credit: invoice.vat,
          description: `KDV - ${invoice.invoiceNumber}`,
        },
      ],
      createdAt: new Date().toISOString(),
    }
  } else {
    // Genel Muhasebe - double entry
    return {
      id: generateId(),
      companyId: storage.getCompany()!.id,
      voucherNumber,
      sourceType: 'satis-faturasi',
      sourceId: invoice.id,
      date: invoice.date,
      entries: [
        {
          accountCode: '120',
          accountName: 'Alıcılar',
          debit: invoice.total,
          credit: 0,
          description: `Alacak - ${invoice.customerName}`,
        },
        {
          accountCode: '600',
          accountName: 'Gelir',
          debit: 0,
          credit: invoice.subtotal,
          description: `Satış geliri`,
        },
        {
          accountCode: '191',
          accountName: 'KDV',
          debit: 0,
          credit: invoice.vat,
          description: `KDV`,
        },
      ],
      createdAt: new Date().toISOString(),
    }
  }
}

export function AccountingSales() {
  const invoices = storage.getInvoices()
  const vouchers = storage.getVouchers()
  const company = storage.getCompany()!
  const [voucherPreview, setVoucherPreview] = useState<AccountingVoucher | null>(null)

  const invoicesWithVouchers = invoices.map((inv) => {
    const voucher = vouchers.find((v) => v.sourceId === inv.id && v.sourceType === 'satis-faturasi')
    return { invoice: inv, voucher }
  })

  const handleGenerateVoucher = (invoiceId: string) => {
    const voucher = generateVoucher(invoiceId, company.mode)
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
        <h1 className="text-3xl font-bold">Satış Faturaları</h1>
        <p className="text-slate-600 mt-2">Satış faturalarından muhasebe fişi oluşturun</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesWithVouchers.map(({ invoice, voucher }) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
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
                          onClick={() => handleGenerateVoucher(invoice.id)}
                        >
                          Fiş Üret
                        </Button>
                      )}
                      {voucher && (
                        <span className="text-sm text-muted-foreground">
                          {voucher.voucherNumber}
                        </span>
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
              <div>
                <p className="text-sm text-muted-foreground">Tarih</p>
                <p className="font-medium">{formatDate(voucherPreview.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fiş Kayıtları</p>
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
              </div>
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
