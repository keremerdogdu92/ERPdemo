import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { InvoiceStatus, InvoiceEvent } from '@/types'
import { ArrowLeft } from 'lucide-react'

const statusFlow: InvoiceStatus[] = [
  'Taslak',
  'Gönderildi',
  'Onaylandı',
  'GİB\'e İletildi',
  'PDF Oluşturuldu',
]

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const invoices = storage.getInvoices()
  const invoice = invoices.find((inv) => inv.id === id)

  if (!invoice) {
    return (
      <div>
        <p>Fatura bulunamadı.</p>
        <Button onClick={() => navigate('/fatura/satis')}>Geri Dön</Button>
      </div>
    )
  }

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    const updatedInvoice = {
      ...invoice,
      status: newStatus,
      events: [
        ...invoice.events,
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: newStatus,
        },
      ],
      updatedAt: new Date().toISOString(),
    }

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoice.id ? updatedInvoice : inv
    )
    storage.setInvoices(updatedInvoices)
  }

  const getNextStatus = (): InvoiceStatus | null => {
    const currentIndex = statusFlow.indexOf(invoice.status)
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null
    return statusFlow[currentIndex + 1]
  }

  const canCancel = invoice.status !== 'İptal' && invoice.status !== 'İade'
  const canReturn = invoice.status === 'PDF Oluşturuldu'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/fatura/satis')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-slate-600 mt-2">Fatura Detayları</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fatura Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Müşteri</p>
              <p className="font-medium">{invoice.customerName}</p>
              <p className="text-sm text-muted-foreground">Vergi No: {invoice.customerTaxId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fatura Tarihi</p>
              <p className="font-medium">{formatDateTime(invoice.date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vade Tarihi</p>
              <p className="font-medium">{formatDateTime(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durum</p>
              <Badge className="mt-1">{invoice.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toplamlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>KDV:</span>
              <span>{formatCurrency(invoice.vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Genel Toplam:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fatura Kalemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Açıklama</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Birim Fiyat</TableHead>
                <TableHead>KDV %</TableHead>
                <TableHead>Toplam</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>%{item.vatRate}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Durum İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getNextStatus() && (
              <Button onClick={() => handleStatusChange(getNextStatus()!)}>
                {getNextStatus() === 'Gönderildi' && 'Gönder'}
                {getNextStatus() === 'Onaylandı' && 'Onayla'}
                {getNextStatus() === 'GİB\'e İletildi' && 'GİB\'e İlet'}
                {getNextStatus() === 'PDF Oluşturuldu' && 'PDF Oluştur'}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => handleStatusChange('İptal')}
              >
                İptal Et
              </Button>
            )}
            {canReturn && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('İade')}
              >
                İade Oluştur
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Olay Geçmişi (Audit Trail)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoice.events.map((event) => (
              <div key={event.id} className="flex items-center gap-4 border-l-2 pl-4">
                <div className="flex-1">
                  <p className="font-medium">{event.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(event.timestamp)}
                  </p>
                  {event.note && (
                    <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
