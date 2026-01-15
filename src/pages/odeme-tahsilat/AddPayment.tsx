// src/pages/odeme-tahsilat/AddPayment.tsx
// Summary: Creates a "payment" (odeme) record for the demo and stores it in localStorage.
// - Supports optional incoming invoice reference.
// - Auto-fills amount when an incoming invoice is selected.
// - Performs minimal validation and avoids crashing when company is missing.
// Integrations:
// - storage.getCompany/getIncomingInvoices/getPayments/setPayments

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { Payment, PaymentType } from '@/types'

function safeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function AddPayment() {
  const navigate = useNavigate()
  const company = storage.getCompany()

  if (!company) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Ödeme Ekle</h1>
        <p className="text-slate-600">Şirket bilgisi bulunamadı. Lütfen önce firma kurulumunu tamamlayın.</p>
      </div>
    )
  }

  const incomingInvoices = storage.getIncomingInvoices()
  const incomingOptions = useMemo(() => {
    return [...incomingInvoices].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [incomingInvoices])

  const [type, setType] = useState<PaymentType>('kasa')
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [referenceId, setReferenceId] = useState<string>('')

  const handleReferenceChange = (nextRefId: string) => {
    setReferenceId(nextRefId)

    // Demo UX: auto-fill amount from referenced incoming invoice.
    if (!nextRefId) return
    const inv = incomingInvoices.find((x) => x.id === nextRefId)
    if (inv) {
      setAmount(String(inv.total ?? 0))
      if (!description.trim()) {
        setDescription(`${inv.invoiceNumber} ödemesi`)
      }
    }
  }

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      alert('Lütfen geçerli bir tutar girin (0’dan büyük olmalı).')
      return
    }

    const nowIso = new Date().toISOString()
    const today = nowIso.split('T')[0]

    const payment: Payment = {
      id: safeId('pay'),
      companyId: company.id,
      type,
      direction: 'odeme',
      amount: parsedAmount,
      description: description.trim(),
      referenceType: referenceId ? 'incoming-invoice' : 'manual',
      referenceId: referenceId || undefined,
      date: today,
      createdAt: nowIso,
    }

    const payments = storage.getPayments()
    storage.setPayments([...payments, payment])

    setAmount('')
    setDescription('')
    setReferenceId('')

    navigate('/odeme-tahsilat/pozisyon')
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
              <Select id="type" value={type} onChange={(e) => setType(e.target.value as PaymentType)}>
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
            <Select id="reference" value={referenceId} onChange={(e) => handleReferenceChange(e.target.value)}>
              <option value="">Manuel Ödeme</option>
              {incomingOptions.map((inv) => (
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/odeme-tahsilat/pozisyon')}>
              Vazgeç
            </Button>
            <Button onClick={handleSubmit}>Kaydet</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
