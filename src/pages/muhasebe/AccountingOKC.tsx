import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
