import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Navbar from './Navbar'
import CartModal from './CartModal'
import TableQRModal from './TableQRModal'

/**
 * [คนที่ 1 รับผิดชอบ]
 * CustomerLayout - โครงสร้างหน้าเว็บฝั่งหน้าร้านสำหรับลูกค้า (มี Navbar ลูกค้า, ตะกร้าสินค้า และ QR Modal)
 */
export default function CustomerLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isQROpen, setIsQROpen] = useState(false)

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
      />

      <main className="flex-1 min-w-0">
        <Outlet context={{ onOpenCart: () => setIsCartOpen(true) }} />
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            <strong>SUKI HOTPOT</strong> — ระบบสั่งอาหารสำหรับลูกค้าผ่าน QR Code
          </span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-red-600 transition-colors">
              เลือกโต๊ะ
            </Link>
            <Link to="/menu" className="hover:text-red-600 transition-colors">
              เมนูสุกี้
            </Link>
            <Link to="/my-orders" className="hover:text-red-600 transition-colors">
              สถานะออร์เดอร์
            </Link>
            <Link
              to="/staff/orders"
              className="text-slate-700 font-semibold hover:text-red-600 transition-colors"
            >
              สำหรับพนักงาน / Admin →
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal ตะกร้าสินค้า และ QR Code ประจำโต๊ะ (เฉพาะฝั่งลูกค้า) */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <TableQRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
    </div>
  )
}
