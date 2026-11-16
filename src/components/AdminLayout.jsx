import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  ChefHat,
  Settings,
  BarChart3,
  Store,
  BellRing,
  Clock
} from 'lucide-react'
import { getAllOrders, getTables } from '../services/sukiApi'

/**
 * [คนที่ 2 รับผิดชอบ]
 * AdminLayout - โครงสร้างหน้าเว็บฝั่งหลังบ้านสำหรับพนักงานครัวและ Admin (แยกจากหน้าร้านลูกค้าชัดเจน)
 */
export default function AdminLayout() {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [alertTablesCount, setAlertTablesCount] = useState(0)

  useEffect(() => {
    const fetchBackofficeCounts = async () => {
      try {
        const [ordersData, tablesData] = await Promise.all([
          getAllOrders(),
          getTables()
        ])
        setPendingOrdersCount(
          ordersData.filter((o) => o.status === 'pending').length
        )
        setAlertTablesCount(
          tablesData.filter(
            (t) => t.status === 'calling' || t.status === 'billing'
          ).length
        )
      } catch {
        // ข้ามกรณีออฟไลน์ชั่วคราว
      }
    }

    fetchBackofficeCounts()
    const timer = setInterval(fetchBackofficeCounts, 3000)
    return () => clearInterval(timer)
  }, [])

  const sidebarLinkClass = ({ isActive }) =>
    `flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-red-600 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <div className="min-h-dvh flex flex-col bg-slate-100 text-slate-800">
      {/* Top Bar ของระบบหลังบ้าน */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  SUKI BACKOFFICE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                  Staff & Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ระบบจัดการห้องครัว เมนูอาหาร และสถิติยอดขาย
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {alertTablesCount > 0 && (
              <Link
                to="/staff/orders"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold animate-pulse"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>มีโต๊ะเรียก/เช็กบิล {alertTablesCount} โต๊ะ</span>
              </Link>
            )}

            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/15 transition-colors"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>ไปหน้าร้านลูกค้า (View Store)</span>
            </Link>
          </div>
        </div>
      </header>

      {/* โครงสร้าง Sidebar ด้านซ้าย + เนื้อหาหลักด้านขวา (ตามแนวทาง Lab 11) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs lg:sticky lg:top-22 overscroll-contain space-y-4">
          <div>
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              เมนูระบบหลังบ้าน
            </p>
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
              <NavLink to="/staff/orders" className={sidebarLinkClass}>
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <ChefHat className="w-4 h-4 shrink-0" />
                  <span>ห้องครัว / รับออร์เดอร์</span>
                </span>
                {pendingOrdersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                    {pendingOrdersCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/admin/menus" className={sidebarLinkClass}>
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>จัดการเมนูอาหาร</span>
                </span>
              </NavLink>

              <NavLink to="/admin/dashboard" className={sidebarLinkClass}>
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>สถิติและภาพรวมร้าน</span>
                </span>
              </NavLink>
            </nav>
          </div>

          {/* กล่องสถานะด่วนสำหรับพนักงาน */}
          <div className="hidden lg:block pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  ออร์เดอร์รอรับ
                </span>
                <span className="font-bold text-slate-900">
                  {pendingOrdersCount} รายการ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-red-500" />
                  โต๊ะเรียก/เช็กบิล
                </span>
                <span className="font-bold text-slate-900">
                  {alertTablesCount} โต๊ะ
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* พื้นที่แสดงหน้า StaffOrdersPage, AdminMenuPage หรือ AdminDashboardPage */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
