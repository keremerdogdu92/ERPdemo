// src/App.tsx
// Summary: Application router for the ERP demo.
// - Defines the first-run setup route (/setup) and the authenticated app shell (Layout) routes.
// - Uses ProtectedRoute to ensure company setup exists in localStorage before allowing access.
// Integrations:
// - storage.getCompany() for first-run gate.
// - Layout shell wraps all feature routes.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import CompanySetup from '@/pages/CompanySetup'
import { Dashboard } from '@/pages/Dashboard'
import { Settings } from '@/pages/Settings'
import { storage } from '@/lib/storage'

// Fatura pages
import { NewInvoice } from '@/pages/fatura/NewInvoice'
import { ZReportEntry } from '@/pages/fatura/ZReportEntry'
import { SalesInvoices } from '@/pages/fatura/SalesInvoices'
import { InvoiceDetail } from '@/pages/fatura/InvoiceDetail'

// Gelen Fatura pages
import { IncomingInvoices } from '@/pages/gelen-fatura/IncomingInvoices'
import { PurchaseInvoices } from '@/pages/gelen-fatura/PurchaseInvoices'
import { IncomingInvoiceDetail } from '@/pages/gelen-fatura/IncomingInvoiceDetail'

// Ödeme ve Tahsilat pages
import { AddCollection } from '@/pages/odeme-tahsilat/AddCollection'
import { AddPayment } from '@/pages/odeme-tahsilat/AddPayment'
import { PositionSummary } from '@/pages/odeme-tahsilat/PositionSummary'

// Envanter pages
import { StockItems } from '@/pages/envanter/StockItems'
import { StockMovements } from '@/pages/envanter/StockMovements'
import { Expenses } from '@/pages/envanter/Expenses'
import { Services } from '@/pages/envanter/Services'

// Muhasebe pages
import { AccountingSales } from '@/pages/muhasebe/AccountingSales'
import { AccountingPurchase } from '@/pages/muhasebe/AccountingPurchase'
import { AccountingOKC } from '@/pages/muhasebe/AccountingOKC'
import { AccountingZReport } from '@/pages/muhasebe/AccountingZReport'

// Defter Beyan
import { DefterBeyan } from '@/pages/DefterBeyan'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const company = storage.getCompany()
  if (!company) {
    return <Navigate to="/setup" replace />
  }
  return <>{children}</>
}

function App() {
  const company = storage.getCompany()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/setup"
          element={company ? <Navigate to="/" replace /> : <CompanySetup />}
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/ayarlar" element={<Settings />} />

                  {/* Fatura routes */}
                  <Route path="/fatura/yeni" element={<NewInvoice />} />
                  <Route path="/fatura/z-raporu" element={<ZReportEntry />} />
                  <Route path="/fatura/satis" element={<SalesInvoices />} />
                  <Route path="/fatura/:id" element={<InvoiceDetail />} />

                  {/* Gelen Fatura routes */}
                  <Route path="/gelen-fatura/liste" element={<IncomingInvoices />} />
                  <Route path="/gelen-fatura/alis" element={<PurchaseInvoices />} />
                  <Route path="/gelen-fatura/:id" element={<IncomingInvoiceDetail />} />

                  {/* Ödeme ve Tahsilat routes */}
                  <Route path="/odeme-tahsilat/tahsilat" element={<AddCollection />} />
                  <Route path="/odeme-tahsilat/odeme" element={<AddPayment />} />
                  <Route path="/odeme-tahsilat/pozisyon" element={<PositionSummary />} />

                  {/* Envanter routes */}
                  <Route path="/envanter/stok" element={<StockItems />} />
                  <Route path="/envanter/stok-hareketleri" element={<StockMovements />} />
                  <Route path="/envanter/giderler" element={<Expenses />} />
                  <Route path="/envanter/hizmetler" element={<Services />} />

                  {/* Muhasebe routes */}
                  <Route path="/muhasebe/satis" element={<AccountingSales />} />
                  <Route path="/muhasebe/alis" element={<AccountingPurchase />} />
                  <Route path="/muhasebe/okc" element={<AccountingOKC />} />
                  <Route path="/muhasebe/z-raporu" element={<AccountingZReport />} />

                  {/* Defter Beyan */}
                  <Route path="/defter-beyan" element={<DefterBeyan />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
