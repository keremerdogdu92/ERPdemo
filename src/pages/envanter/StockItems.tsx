// src/pages/envanter/StockItems.tsx
// Summary: Stock item (inventory card) management for the demo.
// - Lists stock items stored in localStorage via storage.ts.
// - Allows creating a new stock card with basic validation.
// - Uses React state for the list so UI updates immediately after save.
// Integrations:
// - storage.getCompany/getStockItems/setStockItems
// - formatCurrency helper for numeric display.

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { Plus } from 'lucide-react'
import type { StockItem } from '@/types'

function safeId(prefix: string) {
  // Prefer cryptographically strong UUID when available.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function StockItems() {
  const company = storage.getCompany()

  // Guard for demo safety; avoid hard crash if company is missing.
  if (!company) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Stok Kartı</h1>
        <p className="text-slate-600">Şirket bilgisi bulunamadı. Lütfen önce firma kurulumunu tamamlayın.</p>
      </div>
    )
  }

  const [isAdding, setIsAdding] = useState(false)
  const [items, setItems] = useState<StockItem[]>(() => storage.getStockItems())

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    unit: 'Adet',
    stock: 0,
    unitPrice: 0,
  })

  const handleSubmit = () => {
    const code = formData.code.trim()
    const name = formData.name.trim()

    // Minimal validation for demo credibility.
    if (!code || !name) {
      alert('Lütfen stok kodu ve stok adı girin.')
      return
    }
    if (formData.stock < 0 || formData.unitPrice < 0) {
      alert('Stok miktarı ve birim fiyat negatif olamaz.')
      return
    }

    // Prevent duplicate codes within the same company (demo-safe).
    const exists = items.some((x) => x.companyId === company.id && x.code.trim().toLowerCase() === code.toLowerCase())
    if (exists) {
      alert('Bu stok kodu zaten mevcut. Lütfen farklı bir kod girin.')
      return
    }

    const nowIso = new Date().toISOString()

    const item: StockItem = {
      id: safeId('stk'),
      companyId: company.id,
      code,
      name,
      unit: formData.unit.trim() || 'Adet',
      stock: Number(formData.stock) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      createdAt: nowIso,
    }

    const next = [...items, item]
    storage.setStockItems(next)
    setItems(next)

    setFormData({ code: '', name: '', unit: 'Adet', stock: 0, unitPrice: 0 })
    setIsAdding(false)
  }

  const sortedItems = useMemo(() => {
    // Keep the list stable and "professional" (by code).
    return [...items].sort((a, b) => a.code.localeCompare(b.code, 'tr'))
  }, [items])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stok Kartı</h1>
          <p className="text-slate-600 mt-2">Stok kartlarını görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Stok Kartı
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Stok Kartı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Stok Kodu</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Örn: STK-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Stok Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Kulak Kalıbı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Birim</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Örn: Adet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Miktarı</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Birim Fiyat</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>Kaydet</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Stok Kartları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>Ad</TableHead>
                  <TableHead>Birim</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Birim Fiyat</TableHead>
                  <TableHead>Toplam Değer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.stock * item.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Henüz stok kartı yok.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
