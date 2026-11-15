import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Send,
  X,
  Utensils
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'
import { createOrder, getMenus, getTables, updateTableStatus } from '../services/sukiApi'

/**
 * [คนที่ 1 รับผิดชอบ]
 * Component 3: CartModal - หน้าต่างตรวจสอบตะกร้าอาหาร เพิ่ม/ลด/ลบรายการ และกดยืนยันส่งออร์เดอร์เข้าครัว
 */
export default function CartModal({ isOpen, onClose }) {
  const dialogRef = useRef(null)
  const navigate = useNavigate()
  const {
    selectedTable,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    showToast
  } = useOrder()

  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [unavailableMenuIds, setUnavailableMenuIds] = useState([])
  const [checkoutError, setCheckoutError] = useState('')
  const hasUnavailableItems = cart.some((item) => unavailableMenuIds.includes(item.menuId))

  // เปิด-ปิดด้วย Native <dialog> showModal() ตามมาตรฐาน HTML ปัจจุบัน
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleConfirmOrder = async (e) => {
    e.preventDefault()
    if (cart.length === 0 || submitting) return

    try {
      setSubmitting(true)
      setCheckoutError('')
      const [menus, tables] = await Promise.all([getMenus(), getTables()])
      const availableMenuIds = new Set(menus.filter((menu) => menu.available).map((menu) => menu.id))
      const unavailableItems = cart.filter((item) => !availableMenuIds.has(item.menuId))
      setUnavailableMenuIds(unavailableItems.map((item) => item.menuId))
      if (unavailableItems.length > 0) return

      const table = tables.find((item) => item.tableNo === selectedTable)
      if (!table) {
        setCheckoutError(`ไม่พบโต๊ะ ${selectedTable} กรุณาเลือกโต๊ะใหม่`)
        return
      }

      const newOrderPayload = {
        tableNo: selectedTable,
        items: cart.map((item) => ({
          menuId: item.menuId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalPrice: cartTotal,
        status: 'pending',
        note: note.trim(),
        createdAt: new Date().toISOString()
      }

      await createOrder(newOrderPayload)
      clearCart()
      setNote('')
      onClose()
      navigate('/my-orders')

      // เมื่อครัวได้รับออร์เดอร์แล้ว ให้แจ้งผลการอัปเดตโต๊ะแยกกัน
      try {
        if (table.status === 'available') {
          await updateTableStatus(table.id, 'occupied')
        }
        showToast(`ส่งออร์เดอร์โต๊ะ ${selectedTable} เข้าห้องครัวเรียบร้อยแล้ว!`)
      } catch {
        showToast(`ส่งออร์เดอร์โต๊ะ ${selectedTable} แล้ว แต่อัปเดตสถานะโต๊ะไม่สำเร็จ`, 'info')
      }
    } catch (err) {
      setCheckoutError(`ส่งออร์เดอร์ไม่สำเร็จ กรุณาลองอีกครั้ง (${err.message})`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        if (submitting) event.preventDefault()
      }}
      aria-labelledby="cart-modal-title"
      className="m-auto w-full max-w-lg rounded-2xl bg-white p-0 text-slate-800 shadow-2xl border border-slate-200"
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* ส่วนหัว Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cart-modal-title" className="font-bold text-base text-slate-900">
                ตะกร้าสั่งอาหาร — โต๊ะ {selectedTable}
              </h2>
              <p className="text-xs text-slate-500">
                ตรวจสอบรายการและจำนวนก่อนกดยืนยันสั่งอาหาร
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="ปิดหน้าต่างตะกร้า"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {(checkoutError || hasUnavailableItems) && (
          <div role="alert" className="mx-6 mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            {checkoutError || 'บางเมนูหมดหรือถูกนำออกแล้ว กรุณาลบรายการที่ระบุในตะกร้าแล้วลองอีกครั้ง'}
          </div>
        )}

        {/* รายการอาหารในตะกร้า */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Utensils className="w-7 h-7" />
              </div>
              <p className="font-medium text-slate-700">ยังไม่มีรายการอาหารในตะกร้า</p>
              <p className="text-xs text-slate-500 mt-1">
                เลือกเมนูสุกี้ที่ต้องการแล้วกดเพิ่มลงตะกร้าได้เลยครับ
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div
                    key={item.menuId}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-slate-900 truncate">
                        {item.name}
                      </h4>
                      {unavailableMenuIds.includes(item.menuId) && (
                        <p className="text-xs font-semibold text-red-700">เมนูนี้สั่งไม่ได้</p>
                      )}
                      <p className="text-xs text-slate-500">
                        ฿{item.price} x {item.quantity} ={' '}
                        <span className="font-semibold text-red-600">
                          ฿{item.price * item.quantity}
                        </span>
                      </p>
                    </div>

                    {/* ปุ่มลด / เพิ่มจำนวน และปุ่มลบ */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => updateCartQuantity(item.menuId, item.quantity - 1)}
                        aria-label={`ลดจำนวน ${item.name}`}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => updateCartQuantity(item.menuId, item.quantity + 1)}
                        aria-label={`เพิ่มจำนวน ${item.name}`}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => removeFromCart(item.menuId)}
                        aria-label={`ลบ ${item.name} ออกจากตะกร้า`}
                        className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ช่องหมายเหตุถึงห้องครัว */}
              <div className="pt-3 border-t border-slate-100">
                <label
                  htmlFor="order-note"
                  className="block text-xs font-medium text-slate-600 mb-1.5"
                >
                  หมายเหตุเพิ่มเติมถึงห้องครัว (ถ้ามี)
                </label>
                <input
                  id="order-note"
                  type="text"
                  value={note}
                  disabled={submitting}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ขอตะเกียบเพิ่ม, น้ำจิ้มสุกี้พริกกระเทียมเยอะๆ"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}
        </div>

        {/* ส่วนท้าย Modal: สรุปราคาและปุ่มยืนยันการสั่งอาหาร */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block">ยอดรวมรอบนี้</span>
            <span className="text-xl font-bold text-red-600">฿{cartTotal}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 cursor-pointer"
            >
              เลือกอาหารต่อ
            </button>
            <button
              type="button"
              disabled={cart.length === 0 || submitting}
              onClick={handleConfirmOrder}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'กำลังส่งออร์เดอร์...' : 'ยืนยันการสั่งอาหาร'}</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
