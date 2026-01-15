import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'
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

export function DefterBeyan() {
  const [jobs, setJobs] = useState<DefterBeyanJob[]>(storage.getDefterBeyanJobs())

  const updateJobs = (updatedJobs: DefterBeyanJob[]) => {
    storage.setDefterBeyanJobs(updatedJobs)
    setJobs(updatedJobs)
  }

  const handleQueue = (jobId: string) => {
    const updated = jobs.map((job) =>
      job.id === jobId ? { ...job, status: 'pending' as const, logs: [...job.logs, 'Kuyruğa alındı'] } : job
    )
    updateJobs(updated)
  }

  const handleRunNow = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const newLogs = [...j.logs, `[${new Date().toLocaleTimeString('tr-TR')}] İşlem başlatıldı`]
        setTimeout(() => {
          const finalJobs = storage.getDefterBeyanJobs()
          const finalJob = finalJobs.find((j) => j.id === jobId)
          if (finalJob) {
            const success = Math.random() > 0.3 // 70% success rate
            const finalUpdated = finalJobs.map((j) => {
              if (j.id === jobId) {
                return {
                  ...j,
                  status: success ? ('success' as const) : ('error' as const),
                  attemptCount: j.attemptCount + 1,
                  lastRunAt: new Date().toISOString(),
                  logs: [
                    ...j.logs,
                    `[${new Date().toLocaleTimeString('tr-TR')}] ${success ? 'Başarılı' : 'Hata oluştu'}`,
                  ],
                }
              }
              return j
            })
            storage.setDefterBeyanJobs(finalUpdated)
            setJobs(finalUpdated)
          }
        }, 2000)

        return {
          ...j,
          status: 'processing' as const,
          attemptCount: j.attemptCount + 1,
          lastRunAt: new Date().toISOString(),
          logs: newLogs,
        }
      }
      return j
    })
    updateJobs(updated)
  }

  const handleMarkSuccess = (jobId: string) => {
    const updated = jobs.map((job) =>
      job.id === jobId
        ? {
            ...job,
            status: 'success' as const,
            logs: [...job.logs, `[${new Date().toLocaleTimeString('tr-TR')}] Manuel olarak başarılı işaretlendi`],
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
            attemptCount: job.attemptCount + 1,
            logs: [
              ...job.logs,
              `[${new Date().toLocaleTimeString('tr-TR')}] Hata simüle edildi: Bağlantı hatası`,
            ],
          }
        : job
    )
    updateJobs(updated)
  }

  const getSourceLabel = (type: string) => {
    const labels: Record<string, string> = {
      satis: 'Satış',
      alis: 'Alış',
      gider: 'Gider',
      'z-raporu': 'Z Raporu',
      okc: 'ÖKC',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Defter Beyan Gönderim Kuyruğu</h1>
        <p className="text-slate-600 mt-2">Defter beyan işlemlerini yönetin</p>
      </div>

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
                      <Badge className={statusColors[job.status]}>
                        {statusLabels[job.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.attemptCount}</TableCell>
                    <TableCell>{formatDateTime(job.createdAt)}</TableCell>
                    <TableCell>
                      {job.lastRunAt ? formatDateTime(job.lastRunAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {job.status !== 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQueue(job.id)}
                          >
                            Kuyruğa Al
                          </Button>
                        )}
                        {job.status !== 'processing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRunNow(job.id)}
                          >
                            Şimdi Dene
                          </Button>
                        )}
                        {job.status === 'error' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkSuccess(job.id)}
                          >
                            Başarılı İşaretle
                          </Button>
                        )}
                        {job.status !== 'error' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSimulateError(job.id)}
                          >
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
