import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { PaymentType } from '@/types'

export function PositionSummary() {
  const payments = storage.getPayments()

  const calculateBalance = (type: PaymentType, direction: 'tahsilat' | 'odeme') => {
    return payments
      .filter((p) => p.type === type && p.direction === direction)
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const types: PaymentType[] = ['kasa', 'banka', 'cek', 'senet']
  const typeLabels: Record<PaymentType, string> = {
    kasa: 'Kasa',
    banka: 'Banka',
    cek: 'Çek',
    senet: 'Senet',
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
                {types.map((type) => {
                  const tahsilat = calculateBalance(type, 'tahsilat')
                  const odeme = calculateBalance(type, 'odeme')
                  const net = tahsilat - odeme
                  return (
                    <TableRow key={type}>
                      <TableCell className="font-medium">{typeLabels[type]}</TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(tahsilat)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(odeme)}
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(net)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
