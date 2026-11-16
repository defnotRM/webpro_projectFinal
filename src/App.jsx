import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { OrderProvider, useOrder } from './context/OrderContext'

// Layouts แยกฝั่งหน้าร้านลูกค้า และ ฝั่งหลังบ้าน (Staff & Admin)
import CustomerLayout from './components/CustomerLayout'
import AdminLayout from './components/AdminLayout'

// Pages ของคนที่ 1 (ฝั่งหน้าร้านลูกค้า)
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

export default function App() {
  return (
    <OrderProvider>
      <BrowserRouter>
        <ToastBanner />
        <Routes>
          {/* ================= Layout ที่ 1: ฝั่งหน้าร้านลูกค้า (คนที่ 1) ================= */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<TableSelectPage />} />
            <Route path="/menu" element={<MenuOrderPage />} />
            <Route path="/my-orders" element={<CustomerStatusPage />} />
          </Route>

          {/* ============== Layout ที่ 2: ฝั่งหลังบ้าน พนักงาน & Admin (คนที่ 2) ============== */}
          <Route element={<AdminLayout />}>
            <Route path="/staff/orders" element={<StaffOrdersPage />} />
            <Route path="/admin/menus" element={<AdminMenuPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </OrderProvider>
  )
}
