import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { storage } from '@/lib/storage'
import { seedDemoData } from '@/lib/seed'
import type { CompanyMode } from '@/types'

export function CompanySetup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    address: '',
    mode: 'isletme-defteri' as CompanyMode,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const company = {
      id: `company-${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
    }
    storage.setCompany(company)
    seedDemoData()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Firma Bilgileri</CardTitle>
          <CardDescription>
            Lütfen firma bilgilerinizi girin ve muhasebe modunu seçin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Firma Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Vergi Numarası</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Muhasebe Modu</Label>
              <Select
                id="mode"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as CompanyMode })}
                required
              >
                <option value="isletme-defteri">İşletme Defteri</option>
                <option value="genel-muhasebe">Genel Muhasebe</option>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Kaydet ve Devam Et
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
