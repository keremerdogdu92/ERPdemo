import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface RoleModeToggleProps {
  role: UserRole
  onRoleChange: (role: UserRole) => void
}

export function RoleModeToggle({ role, onRoleChange }: RoleModeToggleProps) {
  const isMukellef = role === 'mukellef'

  return (
    <div className="mt-8 pt-4 border-t border-slate-700">
      <div className="px-2 mb-3">
        <p className="text-xs text-slate-400 mb-1">Görünüm Modu</p>
        <p className="text-sm font-semibold text-white">
          {isMukellef ? 'Mükellef Görünümü' : 'Mali Müşavir Görünümü'}
        </p>
      </div>
      
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-1 shadow-sm">
        {/* Sliding indicator */}
        <div
          className={cn(
            'absolute top-1 bottom-1 rounded-xl bg-primary transition-all duration-200 ease-in-out',
            isMukellef ? 'left-1 right-1/2' : 'left-1/2 right-1'
          )}
          aria-hidden="true"
        />
        
        {/* Segments */}
        <div className="relative flex">
          <button
            onClick={() => onRoleChange('mukellef')}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative z-10',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-800',
              isMukellef
                ? 'text-primary-foreground'
                : 'text-slate-400 hover:text-slate-300'
            )}
            aria-pressed={isMukellef}
            aria-label="Mükellef görünümü"
          >
            Mükellef
          </button>
          <button
            onClick={() => onRoleChange('mali-musavir')}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative z-10',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-800',
              !isMukellef
                ? 'text-primary-foreground'
                : 'text-slate-400 hover:text-slate-300'
            )}
            aria-pressed={!isMukellef}
            aria-label="Mali Müşavir görünümü"
          >
            Mali Müşavir
          </button>
        </div>
      </div>
    </div>
  )
}
