import { Link, useLocation } from 'react-router-dom'
import {
  Flame,
  UtensilsCrossed,
  ShoppingBag,
  ClipboardList,
  ChefHat,
  QrCode
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'

/**
 * [คนที่ 1 รับผิดชอบ]
 * Component 1: Navbar - แถบเมนูนำทางเฉพาะฝั่งหน้าร้านลูกค้า (เลือกโต๊ะ, สั่งอาหาร, ดูสถานะออร์เดอร์)
 */
export default function Navbar({ onOpenCart, onOpenQR }) {
  const location = useLocation()
  const { selectedTable, cartCount } = useOrder()

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* โลโก้ร้านสุกี้ (ฝั่งลูกค้า) */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-none">
                SUKI <span className="text-red-600">HOTPOT</span>
              </span>
              <span className="text-xs text-slate-500">
                ระบบสั่งอาหารสำหรับลูกค้า
              </span>
            </div>
          </Link>

          {/* เมนูนำทางเฉพาะลูกค้า 3 หน้า */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/')
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              เลือกโต๊ะ
            </Link>
            <Link
              to="/menu"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/menu')
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              เมนูสุกี้
            </Link>
            <Link
              to="/my-orders"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/my-orders')
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              สถานะออร์เดอร์
            </Link>
          </nav>

          {/* ปุ่มแสดงหมายเลขโต๊ะ ปุ่มตะกร้า และปุ่มสลับไปหน้าหลังบ้านพนักงาน */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenQR}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-sm font-semibold transition-colors cursor-pointer"
              title="ดู QR Code ประจำโต๊ะ"
            >
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>โต๊ะ {selectedTable}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">ตะกร้า</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-white text-red-600 rounded-full min-w-5 text-center">
                  {cartCount}
                </span>
              )}
            </button>

            <Link
              to="/staff/orders"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-600 text-xs font-semibold transition-colors"
              title="เข้าสู่ระบบหลังบ้านสำหรับพนักงานและ Admin"
            >
              <ChefHat className="w-4 h-4" />
              <span>หลังบ้าน</span>
            </Link>
          </div>
        </div>

        {/* แถบเมนูสำหรับมือถือ (เฉพาะลูกค้า + ปุ่มเข้าหลังบ้านริมขวา) */}
        <div className="flex md:hidden items-center justify-between gap-2 py-2 border-t border-slate-100">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <Link
              to="/"
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive('/') ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              เลือกโต๊ะ
            </Link>
            <Link
              to="/menu"
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive('/menu') ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              สั่งอาหาร
            </Link>
            <Link
              to="/my-orders"
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive('/my-orders')
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              สถานะออร์เดอร์
            </Link>
          </div>

          <Link
            to="/staff/orders"
            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap flex items-center gap-1 shrink-0"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>หลังบ้าน</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
