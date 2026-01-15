import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
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
    // Ignore storage errors
  }
}

const menuItems: MenuItem[] = [
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = getExpandedState()
    // Auto-expand groups if current route matches a child
    const initial: Record<string, boolean> = { ...saved }
    
    menuItems.forEach((item) => {
      if (item.isGroup && item.children) {
        const hasActiveChild = item.children.some(
          (child) => location.pathname === child.path || location.pathname.startsWith(child.path + '/')
        )
        if (hasActiveChild && initial[item.title] === undefined) {
          initial[item.title] = true
        }
      }
    })

    if (isMaliMusavir) {
      const muhasebeGroup = 'Muhasebeleştirme'
      if (location.pathname.startsWith('/muhasebe') || location.pathname.startsWith('/defter-beyan')) {
        if (initial[muhasebeGroup] === undefined) {
          initial[muhasebeGroup] = true
        }
      }
    }

    return initial
  })

  useEffect(() => {
    saveExpandedState(expandedGroups)
  }, [expandedGroups])

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  const handleRoleToggle = (newRole: UserRole) => {
    if (role !== newRole) {
      setRole(newRole)
      storage.setRole(newRole)
    }
  }

  const muhasebeItems: MenuItem[] = isMaliMusavir
    ? [
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
    : []

  const allMenuItems = [...menuItems, ...muhasebeItems]

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
                <button
                  onClick={() => toggleGroup(item.title)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    hasActiveChild
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium flex-1 text-left">{item.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
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
                location.pathname === item.path
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
            location.pathname === '/ayarlar'
              ? 'bg-slate-800 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Ayarlar</span>
        </Link>
      </nav>

      {/* Role Toggle */}
      <div className="mt-8 pt-4 border-t border-slate-700">
        <div className="px-2 mb-2">
          <p className="text-xs text-slate-400 mb-2">Görünüm Modu</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => handleRoleToggle('mukellef')}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all',
              role === 'mukellef'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Mükellef
          </button>
          <button
            onClick={() => handleRoleToggle('mali-musavir')}
            className={cn(
              'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all',
              role === 'mali-musavir'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Mali Müşavir
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 px-2 text-center">
          {role === 'mukellef' ? 'Mükellef Görünümü' : 'Mali Müşavir Görünümü'}
        </p>
      </div>
    </div>
  )
}
