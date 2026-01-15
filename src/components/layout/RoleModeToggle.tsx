// src/components/layout/RoleModeToggle.tsx
// Summary: Renders an iOS-style, single-track role mode switch (one sliding knob) for toggling
// between "mukellef" and "mali-musavir" views.
// Integrations:
// - Used by Sidebar to switch visible menu sections (e.g., Muhasebeleştirme / Defter Beyan).
// - Persists role via the caller (Sidebar) using storage.setRole('qnowa_role').
// Accessibility:
// - Clickable left/right halves
// - Keyboard focus + Enter/Space support
// - aria-pressed + clear labeling

import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface RoleModeToggleProps {
  role: UserRole
  onRoleChange: (role: UserRole) => void
}

export function RoleModeToggle({ role, onRoleChange }: RoleModeToggleProps) {
  const isMukellef = role === 'mukellef'

  // We treat each half as a button target to keep interaction obvious and accessible.
  const setMukellef = () => onRoleChange('mukellef')
  const setMaliMusavir = () => onRoleChange('mali-musavir')

  return (
    <div className="mt-8 pt-4 border-t border-slate-700">
      <div className="px-2 mb-3">
        <p className="text-xs text-slate-400 mb-1">Görünüm Modu</p>
        <p className="text-sm font-semibold text-white">
          {isMukellef ? 'Mükellef Görünümü' : 'Mali Müşavir Görünümü'}
        </p>
      </div>

      {/* Single track with one sliding knob (thumb) */}
      <div
        className={cn(
          'relative w-full h-11 rounded-full border border-slate-700 bg-slate-800',
          'p-1 shadow-sm select-none'
        )}
        role="group"
        aria-label="Görünüm modu seçimi"
      >
        {/* Static labels layer (does not move) */}
        <div className="absolute inset-0 flex items-center px-2">
          <div className="flex-1 text-center text-sm font-medium">
            <span className={cn(isMukellef ? 'text-white' : 'text-slate-400')}>Mükellef</span>
          </div>
          <div className="flex-1 text-center text-sm font-medium">
            <span className={cn(!isMukellef ? 'text-white' : 'text-slate-400')}>Mali Müşavir</span>
          </div>
        </div>

        {/* Sliding knob sits under the active label */}
        <div
          className={cn(
            'absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full',
            'bg-slate-900/70 shadow-md ring-1 ring-white/10',
            'transition-transform duration-200 ease-in-out'
          )}
          style={{
            transform: isMukellef ? 'translateX(0%)' : 'translateX(100%)',
          }}
          aria-hidden="true"
        />

        {/* Click targets (two halves). Kept above knob for reliable interaction. */}
        <div className="relative z-10 grid grid-cols-2 h-full">
          <button
            type="button"
            onClick={setMukellef}
            className={cn(
              'h-full rounded-full focus:outline-none',
              'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900'
            )}
            aria-pressed={isMukellef}
            aria-label="Mükellef görünümünü seç"
          >
            <span className="sr-only">Mükellef</span>
          </button>

          <button
            type="button"
            onClick={setMaliMusavir}
            className={cn(
              'h-full rounded-full focus:outline-none',
              'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900'
            )}
            aria-pressed={!isMukellef}
            aria-label="Mali müşavir görünümünü seç"
          >
            <span className="sr-only">Mali Müşavir</span>
          </button>
        </div>
      </div>
    </div>
  )
}
