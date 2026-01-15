// src/pages/fatura/SalesInvoices.tsx
// Summary: Lists sales invoices from localStorage and supports searching/filtering.
// Integrations:
// - storage.getCompany/getInvoices()
// - Navigates to create page and invoice detail pages.
// Notes:
// - Company-scoped listing to avoid cross-company mixing in demo expansions.

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { InvoiceStatus } from '@/types'
import { Plus } from 'lucide-react'

const statusColors: Record<InvoiceStatus, string> = {
  Taslak: 'bg-gray-500',
  Gönderildi: 'bg-blue-500',
  Onaylandı: 'bg-yellow-500',
  "GİB'e İletildi": 'bg-purple-500',
  'PDF Oluşturuldu': 'bg-green-500',
  İptal: 'bg-red-500',
  İade: 'bg-orange-500',
}

export function SalesInvoices() {
  const navigate = useNavigate()
  const company = storage.getCompany()
  const invoicesAll = storage.getInvoices()

  const invoices = useMemo(() => {
    if (!company) return []
    return invoicesAll.filter((inv) => inv.companyId === company.id)
  }, [company, invoicesAll])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Satış Belge Görüntüle</h1>
          <p className="text-slate-600 mt-2">Tüm satış faturalarını görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={() => navigate('/fatura/yeni')}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Fatura
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Fatura no veya müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="Taslak">Taslak</option>
              <option value="Gönderildi">Gönderildi</option>
              <option value="Onaylandı">Onaylandı</option>
              <option value="GİB'e İletildi">GİB&apos;e İletildi</option>
              <option value="PDF Oluşturuldu">PDF Oluşturuldu</option>
              <option value="İptal">İptal</option>
              <option value="İade">İade</option>
            </select>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Vade</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/fatura/${invoice.id}`)}>
                        Detay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Fatura bulunamadı.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
