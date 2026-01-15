import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { Plus } from 'lucide-react'

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function Expenses() {
  const company = storage.getCompany()!
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    vatRate: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
  })
  const expenses = storage.getExpenses()

  const handleSubmit = () => {
    const vatAmount = formData.amount * (formData.vatRate / 100)
    const total = formData.amount + vatAmount

    const expense = {
      id: generateId(),
      companyId: company.id,
      ...formData,
      vatAmount,
      total,
      createdAt: new Date().toISOString(),
    }

    storage.setExpenses([...expenses, expense])
    setFormData({
      description: '',
      amount: 0,
      vatRate: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
    })
    setIsAdding(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Giderler</h1>
          <p className="text-slate-600 mt-2">Giderleri görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Gider
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Gider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Tutar</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatRate">KDV %</Label>
                <Select
                  id="vatRate"
                  value={formData.vatRate}
                  onChange={(e) =>
                    setFormData({ ...formData, vatRate: parseFloat(e.target.value) })
                  }
                >
                  <option value="0">0%</option>
                  <option value="1">1%</option>
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
          <CardTitle>Giderler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>KDV</TableHead>
                  <TableHead>Toplam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{formatCurrency(expense.vatAmount)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(expense.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
