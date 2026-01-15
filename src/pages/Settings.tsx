import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { storage } from '@/lib/storage'
import { seedDemoData } from '@/lib/seed'

export function Settings() {
  const navigate = useNavigate()
  const role = storage.getRole()
  const company = storage.getCompany()

  const handleResetDemo = () => {
    if (confirm('Demo verilerini sıfırlamak istediğinize emin misiniz?')) {
      storage.clearAll()
      if (company) {
        storage.setCompany(company)
      }
      seedDemoData()
      alert('Demo verileri sıfırlandı.')
      navigate('/')
    }
  }

  const handleEditCompany = () => {
    if (confirm('Firma bilgilerini düzenlemek için uygulama sıfırlanacak. Devam etmek istiyor musunuz?')) {
      storage.clearAll()
      navigate('/setup')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-slate-600 mt-2">Uygulama ayarları ve tercihler</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Görünüm Modu</CardTitle>
          <CardDescription>
            Mevcut görünüm modunuz. Değiştirmek için sol menüdeki toggle kullanın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mevcut Mod</Label>
            <p className="text-sm font-medium">
              {role === 'mukellef' ? 'Mükellef Görünümü' : 'Mali Müşavir Görünümü'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {role === 'mukellef'
                ? 'Standart kullanıcı görünümü aktif.'
                : 'Mali Müşavir menüleri görünür durumda.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Firma Bilgileri</CardTitle>
          <CardDescription>Firma bilgilerinizi görüntüleyin veya düzenleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company && (
            <div className="space-y-2">
              <div>
                <Label>Firma Adı</Label>
                <p className="text-sm font-medium">{company.name}</p>
              </div>
              <div>
                <Label>Vergi Numarası</Label>
                <p className="text-sm font-medium">{company.taxId}</p>
              </div>
              <div>
                <Label>Adres</Label>
                <p className="text-sm font-medium">{company.address}</p>
              </div>
              <div>
                <Label>Muhasebe Modu</Label>
                <p className="text-sm font-medium">
                  {company.mode === 'isletme-defteri' ? 'İşletme Defteri' : 'Genel Muhasebe'}
                </p>
              </div>
            </div>
          )}
          <Button onClick={handleEditCompany} variant="outline">
            Firma Bilgilerini Düzenle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo Verileri</CardTitle>
          <CardDescription>
            Demo verilerini sıfırlayarak uygulamayı başlangıç durumuna getirin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleResetDemo} variant="destructive">
            Demo Verilerini Sıfırla
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
