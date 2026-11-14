import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { OrderProvider, useOrder } from './context/OrderContext'

// Components หลักที่ใช้ร่วมใน Layout
import Navbar from './components/Navbar'
import CartModal from './components/CartModal'
import TableQRModal from './components/TableQRModal'

// Pages ของคนที่ 1 (ฝั่งลูกค้า)
import TableSelectPage from './pages/TableSelectPage'
import MenuOrderPage from './pages/MenuOrderPage'
import CustomerStatusPage from './pages/CustomerStatusPage'

// Pages ของคนที่ 2 (ฝั่งพนักงานครัวและผู้ดูแลระบบ)
import StaffOrdersPage from './pages/StaffOrdersPage'
import AdminMenuPage from './pages/AdminMenuPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function ToastBanner() {
  const { toast } = useOrder()
  if (!toast) return null

  const styleMap = {
    success: 'bg-slate-900 text-white border-slate-700',
    error: 'bg-red-600 text-white border-red-700',
    info: 'bg-blue-600 text-white border-blue-700'
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-bounce">
      <div
        className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 ${
          styleMap[toast.type] || styleMap.success
        }`}
      >
        {toast.type === 'error' ? (
          <AlertCircle className="w-4 h-4 shrink-0" />
        ) : toast.type === 'info' ? (
          <Info className="w-4 h-4 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  )
}

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isQROpen, setIsQROpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
      />

      <ToastBanner />

      <main className="flex-1">
        <Routes>
          {/* ================= หน้าที่ 1-3: คนที่ 1 (ฝั่งลูกค้า) ================= */}
          <Route path="/" element={<TableSelectPage />} />
          <Route
            path="/menu"
            element={<MenuOrderPage onOpenCart={() => setIsCartOpen(true)} />}
          />
          <Route path="/my-orders" element={<CustomerStatusPage />} />

          {/* ============== หน้าที่ 4-6: คนที่ 2 (ฝั่งพนักงาน & Admin) ============== */}
          <Route path="/staff/orders" element={<StaffOrdersPage />} />
          <Route path="/admin/menus" element={<AdminMenuPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            <strong>SUKI HOTPOT</strong> — ระบบจัดการออร์เดอร์ร้านสุกี้ (Web Programming Final Project)
          </span>
          <span>พัฒนาด้วย React + Vite + Tailwind CSS + JSON Server</span>
        </div>
      </footer>

      {/* Modal ตะกร้าสินค้า และ QR Code ประจำโต๊ะ */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <TableQRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <OrderProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </OrderProvider>
  )
}
