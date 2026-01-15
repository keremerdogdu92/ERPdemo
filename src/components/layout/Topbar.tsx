import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { storage } from '@/lib/storage'

export function Topbar() {
  const company = storage.getCompany()

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Ara..."
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {company && (
          <div className="text-sm text-slate-600">
            Firma: <span className="font-semibold">{company.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
