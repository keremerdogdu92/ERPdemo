// src/pages/CompanySetup.tsx
// Summary: First-run company setup form for the ERP demo.
// - Collects company name, tax identity (TC Kimlik No or Vergi No based on selected mode), address, and accounting mode.
// - Performs client-side validation and normalization for identity number input (digits-only, fixed length).
// Integrations:
// - Persists company via storage.setCompany()
// - Seeds demo records via seedDemoData()
// - Redirects to dashboard via react-router navigate()

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { storage } from '@/lib/storage'
import { seedDemoData } from '@/lib/seed'
import type { CompanyMode } from '@/types'

type FormState = {
  name: string
  taxId: string
  address: string
  mode: CompanyMode
}

function digitsOnly(value: string): string {
  // Security/UX: harden against non-numeric input by stripping everything except digits.
  return value.replace(/\D/g, '')
}

export function CompanySetup() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormState>({
    name: '',
    taxId: '',
    address: '',
    mode: 'isletme-defteri',
  })

  const taxIdSpec = useMemo(() => {
    // Business rule:
    // - isletme-defteri => TC Kimlik No (11 digits)
    // - genel-muhasebe  => Vergi No (10 digits)
    if (formData.mode === 'isletme-defteri') {
      return {
        label: 'TC Kimlik No',
        requiredLength: 11,
        placeholder: '11 haneli TC Kimlik No',
      }
    }

    return {
      label: 'Vergi No',
      requiredLength: 10,
      placeholder: '10 haneli Vergi No',
    }
  }, [formData.mode])

  const handleTaxIdChange = (raw: string) => {
    const normalized = digitsOnly(raw).slice(0, taxIdSpec.requiredLength)
    setFormData((prev) => ({ ...prev, taxId: normalized }))
    if (error) setError(null)
  }

  const validate = (): string | null => {
    const trimmedName = formData.name.trim()
    const trimmedAddress = formData.address.trim()
    const normalizedTaxId = digitsOnly(formData.taxId)

    if (!trimmedName) return 'Lütfen firma adını girin.'
    if (!trimmedAddress) return 'Lütfen adres bilgisini girin.'

    if (normalizedTaxId.length !== taxIdSpec.requiredLength) {
      return `${taxIdSpec.label} ${taxIdSpec.requiredLength} haneli olmalıdır.`
    }

    // Extra defensive: ensure only digits even if something bypassed input handler.
    if (!/^\d+$/.test(normalizedTaxId)) {
      return `${taxIdSpec.label} yalnızca rakamlardan oluşmalıdır.`
    }

    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const company = {
      id: `company-${Date.now()}`,
      name: formData.name.trim(),
      taxId: digitsOnly(formData.taxId),
      address: formData.address.trim(),
      mode: formData.mode,
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
          <CardDescription>Lütfen firma bilgilerinizi girin ve muhasebe modunu seçin.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Firma Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (error) setError(null)
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">{taxIdSpec.label}</Label>
              <Input
                id="taxId"
                inputMode="numeric"
                autoComplete="off"
                placeholder={taxIdSpec.placeholder}
                value={formData.taxId}
                onChange={(e) => handleTaxIdChange(e.target.value)}
                maxLength={taxIdSpec.requiredLength}
                required
              />
              <p className="text-xs text-muted-foreground">{taxIdSpec.requiredLength} hane, yalnızca rakam.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value })
                  if (error) setError(null)
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Muhasebe Modu</Label>
              <Select
                id="mode"
                value={formData.mode}
                onChange={(e) => {
                  const nextMode = e.target.value as CompanyMode
                  setFormData((prev) => {
                    // When mode changes, re-normalize taxId to the new length rule.
                    const nextTaxId = digitsOnly(prev.taxId).slice(0, nextMode === 'isletme-defteri' ? 11 : 10)
                    return { ...prev, mode: nextMode, taxId: nextTaxId }
                  })
                  if (error) setError(null)
                }}
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

// Export default as well to be compatible with barrel/index exports and differing import styles.
export default CompanySetup
