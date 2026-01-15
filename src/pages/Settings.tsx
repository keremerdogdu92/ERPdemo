import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { storage } from '@/lib/storage'
import { seedDemoData } from '@/lib/seed'
import type { UserRole } from '@/types'

export function Settings() {
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>(storage.getRole())
  const company = storage.getCompany()

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    storage.setRole(newRole)
  }

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
          <CardTitle>Rol Seçimi</CardTitle>
          <CardDescription>
            Uygulamada görüntülenecek menüleri belirlemek için rolünüzü seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              id="role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            >
              <option value="mukellef">Mükellef</option>
              <option value="mali-musavir">Mali Müşavir</option>
            </Select>
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
