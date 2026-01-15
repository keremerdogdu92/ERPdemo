// src/components/layout/Sidebar.tsx
// Summary: Main left sidebar navigation for the demo app.
// - Renders collapsible menu groups (no navigation on group headers).
// - Persists expanded/collapsed state to localStorage.
// - Shows additional "Mali Müşavir" menus when role is 'mali-musavir'.
// Integrations:
// - storage.getRole / storage.setRole uses localStorage key 'qnowa_role'.
// - RoleModeToggle renders an iOS-style role switch (single track + sliding knob).
// Notes:
// - Routes are not protected; role controls only menu visibility (demo behavior).

import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { ComponentType } from 'react'
import {
  FileText,
  FileDown,
  CreditCard,
  Package,
  BookOpen,
  FileCheck,
  Settings,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { storage } from '@/lib/storage'
import type { UserRole } from '@/types'
import { RoleModeToggle } from './RoleModeToggle'

interface MenuItem {
  title: string
  icon: ComponentType<{ className?: string }>
  path?: string
  children?: { title: string; path: string }[]
  isGroup?: boolean
}

const STORAGE_KEY_EXPANDED = 'qnowa_sidebar_expanded'

function getExpandedState(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_EXPANDED)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveExpandedState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(state))
  } catch {
    // Ignore storage errors (private mode / quota)
  }
}

const baseMenuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'Fatura',
    icon: FileText,
    isGroup: true,
    children: [
      { title: 'Yeni Fatura Oluştur', path: '/fatura/yeni' },
      { title: 'Günlük Z Raporu Giriş', path: '/fatura/z-raporu' },
      { title: 'Satış Belge Görüntüle', path: '/fatura/satis' },
    ],
  },
  {
    title: 'Gelen Faturalar',
    icon: FileDown,
    isGroup: true,
    children: [
      { title: 'Gelen Faturalar', path: '/gelen-fatura/liste' },
      { title: 'Alış Belge Görüntüle', path: '/gelen-fatura/alis' },
    ],
  },
  {
    title: 'Ödeme ve Tahsilat',
    icon: CreditCard,
    isGroup: true,
    children: [
      { title: 'Tahsilat Ekle', path: '/odeme-tahsilat/tahsilat' },
      { title: 'Ödeme Ekle', path: '/odeme-tahsilat/odeme' },
      { title: 'Pozisyon Özeti', path: '/odeme-tahsilat/pozisyon' },
    ],
  },
  {
    title: 'Envanter ve Hizmetler',
    icon: Package,
    isGroup: true,
    children: [
      { title: 'Stok Kartı', path: '/envanter/stok' },
      { title: 'Stok Hareketleri', path: '/envanter/stok-hareketleri' },
      { title: 'Giderler', path: '/envanter/giderler' },
      { title: 'Hizmetler', path: '/envanter/hizmetler' },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const [role, setRole] = useState<UserRole>(storage.getRole())
  const isMaliMusavir = role === 'mali-musavir'

  const muhasebeItems: MenuItem[] = useMemo(() => {
    if (!isMaliMusavir) return []

    return [
      {
        title: 'Muhasebeleştirme',
        icon: BookOpen,
        isGroup: true,
        children: [
          { title: 'Satış Faturaları', path: '/muhasebe/satis' },
          { title: 'Alış Faturaları', path: '/muhasebe/alis' },
          { title: 'ÖKC Fişleri', path: '/muhasebe/okc' },
          { title: 'Z Raporları', path: '/muhasebe/z-raporu' },
        ],
      },
      {
        title: 'Defter Beyan',
        icon: FileCheck,
        path: '/defter-beyan',
      },
    ]
  }, [isMaliMusavir])

  const allMenuItems = useMemo(() => [...baseMenuItems, ...muhasebeItems], [muhasebeItems])

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = getExpandedState()
    const initial: Record<string, boolean> = { ...saved }

    // Auto-expand groups if current route matches a child.
    // This improves UX when deep-linking or refreshing on a subpage.
    allMenuItems.forEach((item) => {
      if (item.isGroup && item.children) {
        const hasActiveChild = item.children.some(
          (child) => location.pathname === child.path || location.pathname.startsWith(child.path + '/')
        )
        if (hasActiveChild && initial[item.title] === undefined) {
          initial[item.title] = true
        }
      }
    })

    return initial
  })

  // Persist expand/collapse to localStorage for demo stability.
  useEffect(() => {
    saveExpandedState(expandedGroups)
  }, [expandedGroups])

  // When role changes to Mali Müşavir, auto-expand the accounting group if user is already on a /muhasebe route.
  useEffect(() => {
    if (!isMaliMusavir) return
    if (!location.pathname.startsWith('/muhasebe') && !location.pathname.startsWith('/defter-beyan')) return

    setExpandedGroups((prev) => {
      if (prev['Muhasebeleştirme'] === true) return prev
      return { ...prev, Muhasebeleştirme: true }
    })
  }, [isMaliMusavir, location.pathname])

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  const handleRoleChange = (newRole: UserRole) => {
    if (role !== newRole) {
      setRole(newRole)
      storage.setRole(newRole)
    }
  }

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Qnowa</h1>
        <p className="text-sm text-slate-400">E-Fatura & Muhasebe</p>
      </div>

      <nav className="space-y-2">
        {allMenuItems.map((item) => {
          if (item.isGroup && item.children) {
            const isExpanded = expandedGroups[item.title] ?? false
            const hasActiveChild = item.children.some(
              (child) => location.pathname === child.path || location.pathname.startsWith(child.path + '/')
            )

            return (
              <div key={item.title}>
                {/* Group header is NOT a Link: it only toggles children visibility. */}
                <button
                  type="button"
                  onClick={() => toggleGroup(item.title)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    hasActiveChild
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  aria-expanded={isExpanded}
                  aria-controls={`sidebar-group-${item.title}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium flex-1 text-left">{item.title}</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div id={`sidebar-group-${item.title}`} className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          'block px-4 py-2 rounded-lg text-sm transition-colors',
                          location.pathname === child.path || location.pathname.startsWith(child.path + '/')
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          // Regular menu item (Dashboard, Defter Beyan, etc.)
          return (
            <Link
              key={item.path}
              to={item.path!}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                location.pathname === item.path ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          )
        })}

        <Link
          to="/ayarlar"
          className={cn(
            'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors mt-4',
            location.pathname === '/ayarlar' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Ayarlar</span>
        </Link>
      </nav>

      <RoleModeToggle role={role} onRoleChange={handleRoleChange} />
    </div>
  )
}
