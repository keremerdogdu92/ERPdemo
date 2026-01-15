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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { storage } from '@/lib/storage'

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  children?: { title: string; path: string }[]
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'Fatura Menüsü',
    icon: FileText,
    path: '/fatura',
    children: [
      { title: 'Yeni Fatura Oluştur', path: '/fatura/yeni' },
      { title: 'Günlük Z Raporu Giriş', path: '/fatura/z-raporu' },
      { title: 'Satış Belge Görüntüle', path: '/fatura/satis' },
    ],
  },
  {
    title: 'Gelen Fatura Menüsü',
    icon: FileDown,
    path: '/gelen-fatura',
    children: [
      { title: 'Gelen Faturalar', path: '/gelen-fatura/liste' },
      { title: 'Alış Belge Görüntüle', path: '/gelen-fatura/alis' },
    ],
  },
  {
    title: 'Ödeme ve Tahsilat Menüsü',
    icon: CreditCard,
    path: '/odeme-tahsilat',
    children: [
      { title: 'Tahsilat Ekle', path: '/odeme-tahsilat/tahsilat' },
      { title: 'Ödeme Ekle', path: '/odeme-tahsilat/odeme' },
      { title: 'Pozisyon Özeti', path: '/odeme-tahsilat/pozisyon' },
    ],
  },
  {
    title: 'Envanter / Giderler / Hizmetler',
    icon: Package,
    path: '/envanter',
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
  const role = storage.getRole()
  const isMaliMusavir = role === 'mali-musavir'

  const muhasebeItems: MenuItem[] = isMaliMusavir
    ? [
        {
          title: 'Muhasebeleştirme Menüsü',
          icon: BookOpen,
          path: '/muhasebe',
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
        {allMenuItems.map((item) => (
          <div key={item.path}>
            <Link
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
            {item.children && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={cn(
                      'block px-4 py-2 rounded-lg text-sm transition-colors',
                      location.pathname === child.path
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
        ))}
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
    </div>
  )
}
