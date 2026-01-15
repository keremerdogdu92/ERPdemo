import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { Payment, PaymentType } from '@/types'

export function AddPayment() {
  const company = storage.getCompany()!
  const incomingInvoices = storage.getIncomingInvoices()
  const [type, setType] = useState<PaymentType>('kasa')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [referenceId, setReferenceId] = useState('')

  const handleSubmit = () => {
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      companyId: company.id,
      type,
      direction: 'odeme',
      amount: parseFloat(amount) || 0,
      description,
      referenceType: referenceId ? 'incoming-invoice' : 'manual',
      referenceId: referenceId || undefined,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }

    const payments = storage.getPayments()
    storage.setPayments([...payments, payment])

    setAmount('')
    setDescription('')
    setReferenceId('')
    alert('Ödeme kaydedildi.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ödeme Ekle</h1>
        <p className="text-slate-600 mt-2">Kasa, Banka, Çek veya Senet ile ödeme ekleyin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Ödeme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Ödeme Türü</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as PaymentType)}
              >
                <option value="kasa">Kasa</option>
                <option value="banka">Banka</option>
                <option value="cek">Çek</option>
                <option value="senet">Senet</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Gelen Fatura Referansı (Opsiyonel)</Label>
            <Select
              id="reference"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            >
              <option value="">Manuel Ödeme</option>
              {incomingInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {inv.supplierName} ({formatCurrency(inv.total)})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ödeme açıklaması"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Kaydet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
