// src/pages/DefterBeyan.tsx
// Summary: Manages Defter Beyan job queue in a demo-friendly and controlled way.
// - Allows creating new jobs from existing sources (sales invoices, incoming invoices, Z reports, OKC vouchers, expenses).
// - Prevents duplicate jobs for the same (sourceType, sourceId).
// - Provides actions to queue, run now (simulated), mark success, and simulate error.
// Integrations:
// - storage.getCompany/getInvoices/getIncomingInvoices/getZReports/getExpenses/getVouchers
// - storage.getDefterBeyanJobs/setDefterBeyanJobs
// - UI: Card, Table, Badge, Button, Select, Input

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { DefterBeyanJob } from '@/types'

const statusColors: Record<DefterBeyanJob['status'], string> = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
}

const statusLabels: Record<DefterBeyanJob['status'], string> = {
  pending: 'Bekliyor',
  processing: 'İşleniyor',
  success: 'Başarılı',
  error: 'Hata',
}

function safeId(prefix: string) {
  // Prefer crypto UUID when available to reduce collision risk.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function nowTrTime(): string {
  // Human readable time for logs in TR locale.
  return new Date().toLocaleTimeString('tr-TR')
}

function getSourceLabel(type: string) {
  const labels: Record<string, string> = {
    satis: 'Satış',
    alis: 'Alış',
    gider: 'Gider',
    'z-raporu': 'Z Raporu',
    okc: 'ÖKC',
  }
  return labels[type] || type
}

function ensureNoDuplicateJob(jobs: DefterBeyanJob[], sourceType: DefterBeyanJob['sourceType'], sourceId: string) {
  return jobs.some((j) => j.sourceType === sourceType && j.sourceId === sourceId)
}

export function DefterBeyan() {
  const company = storage.getCompany()

  // Guard against missing company in demo.
  if (!company) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Defter Beyan Gönderim Kuyruğu</h1>
        <p className="text-slate-600">Şirket bulunamadı. Lütfen önce firma kurulumunu tamamlayın.</p>
      </div>
    )
  }

  const [jobs, setJobs] = useState<DefterBeyanJob[]>(storage.getDefterBeyanJobs())

  // Source data for job creation
  const invoices = storage.getInvoices()
  const incomingInvoices = storage.getIncomingInvoices()
  const zReports = storage.getZReports()
  const expenses = (storage as any).getExpenses ? (storage as any).getExpenses() : []
  const vouchers = storage.getVouchers()

  // OKC vouchers are stored as vouchers with sourceType === 'okc-fisi' (per our demo setup).
  const okcVouchers = useMemo(() => vouchers.filter((v) => v.sourceType === 'okc-fisi'), [vouchers])

  const [newSourceType, setNewSourceType] = useState<DefterBeyanJob['sourceType']>('satis')
  const [newSourceId, setNewSourceId] = useState<string>('')

  const updateJobs = (updatedJobs: DefterBeyanJob[]) => {
    storage.setDefterBeyanJobs(updatedJobs)
    setJobs(updatedJobs)
  }

  const handleCreateJob = () => {
    if (!newSourceId) {
      alert('Lütfen kaynak kaydı seçin.')
      return
    }

    const current = storage.getDefterBeyanJobs()
    if (ensureNoDuplicateJob(current, newSourceType, newSourceId)) {
      alert('Bu kaynak için zaten bir Defter Beyan işi mevcut.')
      return
    }

    const job: DefterBeyanJob = {
      id: safeId('dbj'),
      companyId: company.id,
      sourceType: newSourceType,
      sourceId: newSourceId,
      status: 'pending',
      attemptCount: 0,
      createdAt: new Date().toISOString(),
      logs: [`[${nowTrTime()}] İş oluşturuldu`, `[${nowTrTime()}] Kuyruğa alındı`],
    }

    const updated = [job, ...current]
    updateJobs(updated)
    setNewSourceId('')
    alert('İş kuyruğa eklendi.')
  }

  const handleQueue = (jobId: string) => {
    const updated = jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: 'pending' as const,
            logs: [...job.logs, `[${nowTrTime()}] Kuyruğa alındı`],
          }
        : job
    )
    updateJobs(updated)
  }

  const handleRunNow = (jobId: string) => {
    const current = storage.getDefterBeyanJobs()
    const job = current.find((j) => j.id === jobId)
    if (!job) return

    // Step 1: mark as processing and increment attemptCount ONCE.
    const processingJobs = current.map((j) => {
      if (j.id !== jobId) return j
      return {
        ...j,
        status: 'processing' as const,
        attemptCount: (j.attemptCount || 0) + 1,
        lastRunAt: new Date().toISOString(),
        logs: [...j.logs, `[${nowTrTime()}] İşlem başlatıldı`],
      }
    })

    storage.setDefterBeyanJobs(processingJobs)
    setJobs(processingJobs)

    // Step 2: simulate remote call result (70% success).
    setTimeout(() => {
      const latest = storage.getDefterBeyanJobs()
      const latestJob = latest.find((j) => j.id === jobId)
      if (!latestJob) return

      const success = Math.random() > 0.3
      const finished = latest.map((j) => {
        if (j.id !== jobId) return j
        return {
          ...j,
          status: success ? ('success' as const) : ('error' as const),
          lastRunAt: new Date().toISOString(),
          logs: [
            ...j.logs,
            `[${nowTrTime()}] ${success ? 'Başarılı' : 'Hata oluştu (simülasyon)'}`,
          ],
        }
      })

      storage.setDefterBeyanJobs(finished)
      setJobs(finished)
    }, 2000)
  }

  const handleMarkSuccess = (jobId: string) => {
    const updated = jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: 'success' as const,
            logs: [...job.logs, `[${nowTrTime()}] Manuel olarak başarılı işaretlendi`],
          }
        : job
    )
    updateJobs(updated)
  }

  const handleSimulateError = (jobId: string) => {
    const updated = jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: 'error' as const,
            attemptCount: (job.attemptCount || 0) + 1,
            lastRunAt: new Date().toISOString(),
            logs: [...job.logs, `[${nowTrTime()}] Hata simüle edildi: Bağlantı hatası`],
          }
        : job
    )
    updateJobs(updated)
  }

  const sourceOptions = useMemo(() => {
    // Build dropdown options based on sourceType.
    if (newSourceType === 'satis') {
      return invoices.map((inv) => ({
        value: inv.id,
        label: `${inv.invoiceNumber} - ${inv.customerName} (${formatCurrency(inv.total)})`,
      }))
    }
    if (newSourceType === 'alis') {
      return incomingInvoices.map((inv) => ({
        value: inv.id,
        label: `${inv.invoiceNumber} - ${inv.supplierName} (${formatCurrency(inv.total)})`,
      }))
    }
    if (newSourceType === 'z-raporu') {
      return zReports.map((r) => ({
        value: r.id,
        label: `${r.date} - Toplam ${formatCurrency(r.total)} (Nakit ${formatCurrency(
          r.cashTotal
        )} / Kart ${formatCurrency(r.cardTotal)})`,
      }))
    }
    if (newSourceType === 'okc') {
      return okcVouchers.map((v) => ({
        value: v.id,
        label: `${v.voucherNumber} - ${v.date}`,
      }))
    }
    if (newSourceType === 'gider') {
      return (expenses || []).map((e: any) => ({
        value: e.id,
        label: `${e.description} - ${formatCurrency(e.total ?? e.amount ?? 0)} (${e.date})`,
      }))
    }
    return []
  }, [newSourceType, invoices, incomingInvoices, zReports, okcVouchers, expenses])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Defter Beyan Gönderim Kuyruğu</h1>
        <p className="text-slate-600 mt-2">Defter beyan işlemlerini yönetin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Gönderim İşi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Kaynak Tip</div>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={newSourceType}
                onChange={(e) => {
                  setNewSourceType(e.target.value as DefterBeyanJob['sourceType'])
                  setNewSourceId('')
                }}
              >
                <option value="satis">Satış</option>
                <option value="alis">Alış</option>
                <option value="z-raporu">Z Raporu</option>
                <option value="okc">ÖKC</option>
                <option value="gider">Gider</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="text-sm text-muted-foreground">Kaynak Kayıt</div>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={newSourceId}
                onChange={(e) => setNewSourceId(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateJob}>Kuyruğa Ekle</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İş Kuyruğu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kaynak Tip</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Deneme</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead>Son Çalışma</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{getSourceLabel(job.sourceType)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[job.status]}>{statusLabels[job.status]}</Badge>
                    </TableCell>
                    <TableCell>{job.attemptCount}</TableCell>
                    <TableCell>{formatDateTime(job.createdAt)}</TableCell>
                    <TableCell>{job.lastRunAt ? formatDateTime(job.lastRunAt) : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {job.status !== 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => handleQueue(job.id)}>
                            Kuyruğa Al
                          </Button>
                        )}
                        {job.status !== 'processing' && (
                          <Button size="sm" variant="outline" onClick={() => handleRunNow(job.id)}>
                            Şimdi Dene
                          </Button>
                        )}
                        {job.status === 'error' && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkSuccess(job.id)}>
                            Başarılı İşaretle
                          </Button>
                        )}
                        {job.status !== 'error' && (
                          <Button size="sm" variant="destructive" onClick={() => handleSimulateError(job.id)}>
                            Hata Simüle Et
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Henüz iş yok.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İş Logları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded p-4">
                <div className="font-medium mb-2">
                  {getSourceLabel(job.sourceType)} - {job.id.slice(0, 8)}
                </div>
                <div className="space-y-1">
                  {job.logs.length > 0 ? (
                    job.logs.map((log, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground font-mono">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">Henüz log yok.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
