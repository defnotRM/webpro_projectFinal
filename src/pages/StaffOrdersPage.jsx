import { useEffect, useState, useMemo } from 'react'
import {
  ChefHat,
  Search,
  BellRing,
  Receipt,
  Check,
  RotateCcw,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getTables,
  updateTableStatus
} from '../services/sukiApi'
import OrderTicketCard from '../components/OrderTicketCard'

/**
 * [คนที่ 2 รับผิดชอบ]
 * Page 4: StaffOrdersPage (/staff/orders) - หน้าจอหลังบ้านพนักงานและห้องครัว รับออร์เดอร์อัตโนมัติและเปลี่ยนสถานะ
 */
export default function StaffOrdersPage() {
  const { showToast } = useOrder()

  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State สำหรับค้นหาเลขโต๊ะ/ชื่ออาหาร และกรองตามสถานะออร์เดอร์
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchKitchenData = async () => {
    try {
      setError(null)
      const [ordersData, tablesData] = await Promise.all([getAllOrders(), getTables()])
      // เรียงออร์เดอร์ใหม่ล่าสุดขึ้นก่อน
      const sortedOrders = [...ordersData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setOrders(sortedOrders)
      setTables(tablesData)
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลจากระบบกลางได้ กรุณาตรวจสอบว่ารัน npm run api แล้ว')
    } finally {
      setLoading(false)
    }
  }

  // ดึงออร์เดอร์ใหม่อัตโนมัติทุกๆ 2.5 วินาที (Real-time Kitchen Dashboard)
  useEffect(() => {
    fetchKitchenData()
    const timer = setInterval(fetchKitchenData, 2500)
    return () => clearInterval(timer)
  }, [])

  // เปลี่ยนสถานะออร์เดอร์ (pending -> preparing -> served)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      const statusText =
        newStatus === 'preparing'
          ? 'กำลังเตรียมอาหาร'
          : newStatus === 'served'
          ? 'เสิร์ฟอาหารแล้ว'
          : 'รอรับออร์เดอร์'
      showToast(`อัปเดตออร์เดอร์ #${orderId} เป็น "${statusText}"`)
      fetchKitchenData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // ลบออร์เดอร์
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId)
      showToast(`ลบออร์เดอร์ #${orderId} เรียบร้อยแล้ว`, 'info')
      fetchKitchenData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // จัดการสถานะโต๊ะ (รับทราบเรียกพนักงาน หรือ เคลียร์โต๊ะว่างหลังเช็กบิล)
  const handleResolveTable = async (table, nextStatus, toastMsg) => {
    try {
      await updateTableStatus(table.id, nextStatus)
      showToast(toastMsg)
      fetchKitchenData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // กรองออร์เดอร์ตามสถานะและคำค้นหาด้วย useMemo
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }
      if (!searchTerm.trim()) return true
      const q = searchTerm.toLowerCase()
      const matchTable = order.tableNo?.toLowerCase().includes(q)
      const matchId = String(order.id).includes(q)
      const matchItem = order.items?.some((i) => i.name.toLowerCase().includes(q))
      return matchTable || matchId || matchItem
    })
  }, [orders, statusFilter, searchTerm])

  // โต๊ะที่กำลังกดเรียกพนักงานหรือขอเช็กบิล
  const alertTables = useMemo(() => {
    return tables.filter((t) => t.status === 'calling' || t.status === 'billing')
  }, [tables])

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      served: orders.filter((o) => o.status === 'served').length
    }
  }, [orders])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ส่วนหัวหน้าจอห้องครัว */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shrink-0">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">
                Kitchen & Staff Order Dashboard
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              แสดงออร์เดอร์ใหม่จากทุกโต๊ะโดยอัตโนมัติ พร้อมระบบเปลี่ยนสถานะและรับแจ้งเตือนจากโต๊ะลูกค้า
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchKitchenData}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* แจ้งเตือนด่วนเมื่อมีโต๊ะกดเรียกพนักงาน หรือ แจ้งขอเช็กบิล */}
      {alertTables.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertTables.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                t.status === 'calling'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-purple-50 border-purple-300 text-purple-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    t.status === 'calling'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-purple-200 text-purple-900'
                  }`}
                >
                  {t.status === 'calling' ? (
                    <BellRing className="w-5 h-5" />
                  ) : (
                    <Receipt className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-sm block">
                    โต๊ะ {t.tableNo} —{' '}
                    {t.status === 'calling' ? 'กำลังเรียกพนักงาน!' : 'แจ้งขอเช็กบิล!'}
                  </span>
                  <span className="text-xs opacity-80">
                    {t.status === 'calling'
                      ? 'ลูกค้าต้องการความช่วยเหลือที่โต๊ะ'
                      : 'ลูกค้าต้องการชำระเงินและปิดโต๊ะ'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {t.status === 'calling' ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleResolveTable(
                        t,
                        'occupied',
                        `รับทราบการเรียกของ โต๊ะ ${t.tableNo} แล้ว`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> รับทราบแล้ว
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleResolveTable(
                        t,
                        'available',
                        `เช็กบิลและเคลียร์ โต๊ะ ${t.tableNo} เป็นโต๊ะว่างแล้ว`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> ชำระเงิน/เคลียร์โต๊ะ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แสดงข้อผิดพลาดกรณีไม่ได้รัน JSON Server */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* แถบค้นหาเลขโต๊ะ และปุ่มกรองสถานะออร์เดอร์ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `ทั้งหมด (${counts.all})` },
            { id: 'pending', label: `รอรับออร์เดอร์ (${counts.pending})` },
            { id: 'preparing', label: `กำลังเตรียมอาหาร (${counts.preparing})` },
            { id: 'served', label: `เสิร์ฟแล้ว (${counts.served})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาเลขโต๊ะ (เช่น A05) หรือชื่อเมนู..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* รายการการ์ดใบออร์เดอร์ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-200/70 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="font-semibold text-slate-700">ไม่มีรายการออร์เดอร์ในหมวดนี้</p>
          <p className="text-xs text-slate-500 mt-1">
            เมื่อลูกค้ากดสั่งอาหารจากหน้าเมนู รายการใหม่จะเด้งขึ้นมาบนหน้านี้โดยอัตโนมัติ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => (
            <OrderTicketCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
            />
          ))}
        </div>
      )}
    </div>
  )
}
