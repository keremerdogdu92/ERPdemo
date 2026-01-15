import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { TrendingUp, DollarSign, Clock } from 'lucide-react'

export function Dashboard() {
  const invoices = storage.getInvoices()
  const payments = storage.getPayments()
  const defterBeyanJobs = storage.getDefterBeyanJobs()

  const today = new Date().toISOString().split('T')[0]
  const todaySales = invoices
    .filter((inv) => inv.date === today)
    .reduce((sum, inv) => sum + inv.total, 0)

  const openReceivables = invoices
    .filter((inv) => inv.status !== 'İptal' && inv.status !== 'İade')
    .reduce((sum, inv) => {
      const paid = payments
        .filter((p) => p.direction === 'tahsilat' && p.referenceId === inv.id)
        .reduce((s, p) => s + p.amount, 0)
      return sum + (inv.total - paid)
    }, 0)

  const cashBalance = payments
    .filter((p) => p.type === 'kasa')
    .reduce((sum, p) => sum + (p.direction === 'tahsilat' ? p.amount : -p.amount), 0)

  const bankBalance = payments
    .filter((p) => p.type === 'banka')
    .reduce((sum, p) => sum + (p.direction === 'tahsilat' ? p.amount : -p.amount), 0)

  const pendingJobs = defterBeyanJobs.filter(
    (job) => job.status === 'pending' || job.status === 'processing'
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600 mt-2">Genel bakış ve özet bilgiler</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Satışlar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todaySales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık Alacaklar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(openReceivables)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kasa + Banka</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(cashBalance + bankBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kasa: {formatCurrency(cashBalance)} | Banka: {formatCurrency(bankBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Defter Beyan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">İşlem bekliyor</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son Faturalar</CardTitle>
            <CardDescription>En son oluşturulan faturalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.customerName} - {formatDate(invoice.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(invoice.total)}</div>
                    <div className="text-sm text-muted-foreground">{invoice.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Ödemeler</CardTitle>
            <CardDescription>En son yapılan ödemeler ve tahsilatlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{payment.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.type} - {formatDate(payment.date)}
                    </div>
                  </div>
                  <div
                    className={`text-right font-medium ${
                      payment.direction === 'tahsilat' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {payment.direction === 'tahsilat' ? '+' : '-'}
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
