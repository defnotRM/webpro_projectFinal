import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Flame,
  CheckCircle2,
  UtensilsCrossed,
  RefreshCw,
  Receipt,
  BellRing
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'
import { getOrdersByTable, getTables, updateTableStatus } from '../services/sukiApi'
import OrderStatusBadge from '../components/OrderStatusBadge'

/**
 * [คนที่ 1 รับผิดชอบ]
 * Page 3: CustomerStatusPage (/my-orders) - หน้าลูกค้าดูสถานะออร์เดอร์ของโต๊ะตนเองแบบ Real-time
 */
export default function CustomerStatusPage() {
  const { selectedTable, setSelectedTable, showToast } = useOrder()
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCustomerOrders = async () => {
    try {
      const [ordersData, tablesData] = await Promise.all([
        getOrdersByTable(selectedTable),
        getTables()
      ])
      // เรียงจากออร์เดอร์ล่าสุดขึ้นก่อน
      const sorted = [...ordersData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setOrders(sorted)
      setTables(tablesData)
    } catch (err) {
      // เงียบไว้เวลา Polling หากเกิดปัญหาชั่วคราว
    } finally {
      setLoading(false)
    }
  }

  // ดึงสถานะออร์เดอร์ใหม่จากระบบกลางทุกๆ 2.5 วินาที (Real-time Order Update)
  useEffect(() => {
    setLoading(true)
    fetchCustomerOrders()
    const interval = setInterval(fetchCustomerOrders, 2500)
    return () => clearInterval(interval)
  }, [selectedTable])

  const grandTotal = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  }, [orders])

  const currentTableObj = tables.find((t) => t.tableNo === selectedTable)

  const handleRequestAction = async (status, message) => {
    if (!currentTableObj) return
    try {
      await updateTableStatus(currentTableObj.id, status)
      showToast(message)
      fetchCustomerOrders()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const getStepProgress = (status) => {
    if (status === 'pending') return 1
    if (status === 'preparing') return 2
    if (status === 'served') return 3
    return 1
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ส่วนหัวและสลับโต๊ะเพื่อดูสถานะ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-sm">
              โต๊ะ {selectedTable}
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              ติดตามสถานะออร์เดอร์ของคุณ
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            อัปเดตสถานะอัตโนมัติจากห้องครัว (ไม่ต้องกดรีเฟรชหน้าเว็บ)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            aria-label="เลือกโต๊ะที่ต้องการดูสถานะ"
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
          >
            {['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08'].map((t) => (
              <option key={t} value={t}>
                ดูออร์เดอร์ โต๊ะ {t}
              </option>
            ))}
          </select>

          <Link
            to="/menu"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>สั่งอาหารเพิ่ม</span>
          </Link>
        </div>
      </div>

      {/* สรุปยอดรวมทั้งหมดของโต๊ะ และปุ่มเรียกพนักงาน / เช็กบิล */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <span className="text-xs text-slate-400">
            ยอดรวมอาหารที่สั่งทั้งหมดของ โต๊ะ {selectedTable} ({orders.length} รอบบิล)
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-0.5">
            ฿{grandTotal.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleRequestAction('calling', `โต๊ะ ${selectedTable} เรียกพนักงานเรียบร้อยแล้ว`)
            }
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>เรียกพนักงาน</span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleRequestAction('billing', `แจ้งขอเช็กบิลโต๊ะ ${selectedTable} เรียบร้อยแล้ว`)
            }
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>แจ้งขอเช็กบิล</span>
          </button>
        </div>
      </div>

      {/* รายการออร์เดอร์แต่ละรอบ */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl bg-slate-200/70 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="font-semibold text-slate-700">
            โต๊ะ {selectedTable} ยังไม่มีประวัติการสั่งอาหาร
          </p>
          <p className="text-xs text-slate-500">
            สามารถกดปุ่มด้านล่างเพื่อเลือกเมนูสุกี้และส่งออร์เดอร์รอบแรกได้เลยครับ
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>ไปที่หน้าเมนูอาหาร</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const step = getStepProgress(order.status)
            const timeStr = new Date(order.createdAt).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit'
            })

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* หัวการ์ดออร์เดอร์ */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900">
                      บิลออร์เดอร์ #{order.id}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      สั่งเมื่อเวลา {timeStr} น.
                    </span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* แถบแสดงลำดับขั้นตอน (Step Progress: รอรับออร์เดอร์ -> กำลังเตรียมอาหาร -> เสิร์ฟแล้ว) */}
                <div className="px-5 pt-4 pb-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                        step >= 1
                          ? 'bg-amber-50 border-amber-200 text-amber-800 font-semibold'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>1. รอรับออร์เดอร์</span>
                    </div>
                    <div
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                        step >= 2
                          ? 'bg-blue-50 border-blue-200 text-blue-800 font-semibold'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span>2. กำลังเตรียมอาหาร</span>
                    </div>
                    <div
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                        step >= 3
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>3. เสิร์ฟแล้ว</span>
                    </div>
                  </div>
                </div>

                {/* รายการอาหารในรอบบิลนี้ */}
                <div className="p-5 space-y-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={`${order.id}-${idx}`}
                      className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            ฿{item.price} x {item.quantity} ถาด
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-700">
                        ฿{item.price * item.quantity}
                      </span>
                    </div>
                  ))}

                  {order.note && (
                    <p className="text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-xl mt-2">
                      <strong>หมายเหตุ:</strong> {order.note}
                    </p>
                  )}

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-500">ยอดรวมรอบนี้</span>
                    <span className="text-base font-bold text-red-600">
                      ฿{order.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
