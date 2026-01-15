import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function AccountingOKC() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ÖKC Fişleri</h1>
        <p className="text-slate-600 mt-2">Özel Kasa Çıkış fişleri</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ÖKC Fişleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Henüz ÖKC fişi bulunmamaktadır.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
