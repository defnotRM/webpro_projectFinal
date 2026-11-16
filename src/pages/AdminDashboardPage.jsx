import { useEffect, useState, useMemo } from 'react'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Utensils,
  Trophy,
  RotateCcw,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'
import { getAllOrders, getMenus, getTables, updateTableStatus } from '../services/sukiApi'
import StatsSummaryCard from '../components/StatsSummaryCard'
import OrderStatusBadge from '../components/OrderStatusBadge'

/**
 * [คนที่ 2 รับผิดชอบ]
 * Page 6: AdminDashboardPage (/admin/dashboard) - หน้าสรุปสถิติยอดขาย เมนูขายดี และระบบจัดการโต๊ะ
 */
export default function AdminDashboardPage() {
  const { showToast } = useOrder()

  const [orders, setOrders] = useState([])
  const [menus, setMenus] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [historyTableFilter, setHistoryTableFilter] = useState('all')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all')

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [ordersData, menusData, tablesData] = await Promise.all([
        getAllOrders(),
        getMenus(),
        getTables()
      ])
      setOrders(
        [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
      setMenus(menusData)
      setTables(tablesData)
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลสถิติจากระบบกลางได้ กรุณาตรวจสอบว่ารัน npm run api แล้ว')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // คำนวณสถิติภาพรวมด้วย useMemo
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
    const totalOrders = orders.length
    const activeTablesCount = tables.filter((t) => t.status !== 'available').length
    const availableMenusCount = menus.filter((m) => m.available).length

    return {
      totalRevenue,
      totalOrders,
      activeTablesCount,
      availableMenusCount
    }
  }, [orders, tables, menus])

  // คำนวณอันดับเมนูขายดีจากประวัติออร์เดอร์ทั้งหมด
  const topSellingItems = useMemo(() => {
    const countMap = {}
    for (const order of orders) {
      for (const item of order.items || []) {
        if (!countMap[item.name]) {
          countMap[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          }
        }
        countMap[item.name].quantity += item.quantity
        countMap[item.name].revenue += item.price * item.quantity
      }
    }
    return Object.values(countMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [orders])

  // กรองประวัติออร์เดอร์ตามโต๊ะและสถานะ
  const filteredHistoryOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchTable =
        historyTableFilter === 'all' || o.tableNo === historyTableFilter
      const matchStatus =
        historyStatusFilter === 'all' || o.status === historyStatusFilter
      return matchTable && matchStatus
    })
  }, [orders, historyTableFilter, historyStatusFilter])

  const handleToggleTableStatus = async (table) => {
    const nextStatus = table.status === 'available' ? 'occupied' : 'available'
    if (nextStatus === 'available') {
      const unserved = orders.filter(
        (o) => o.tableNo === table.tableNo && o.status !== 'served'
      )
      if (unserved.length > 0) {
        showToast(
          `โต๊ะ ${table.tableNo} ยังมีออร์เดอร์ค้างเสิร์ฟ ${unserved.length} รายการ กรุณาเสิร์ฟให้ครบก่อนเคลียร์โต๊ะ`,
          'error'
        )
        return
      }
    }
    try {
      await updateTableStatus(table.id, nextStatus)
      showToast(
        `อัปเดตสถานะ โต๊ะ ${table.tableNo} เป็น "${
          nextStatus === 'available' ? 'โต๊ะว่าง' : 'มีลูกค้า'
        }"`
      )
      fetchDashboardData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard สรุปสถิติและภาพรวมร้านสุกี้
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            สรุปยอดขายรวม อันดับเมนูยอดนิยม สถานะโต๊ะ และประวัติออร์เดอร์ทั้งหมดในระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 self-start sm:self-auto shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>อัปเดตข้อมูลสถิติ</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* การ์ดสรุปสถิติ 4 ด้าน (StatsSummaryCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsSummaryCard
          title="ยอดขายรวมทั้งหมด"
          value={`฿${stats.totalRevenue.toLocaleString()}`}
          subtitle="คำนวณจากทุกออร์เดอร์ในระบบ"
          icon={DollarSign}
          color="emerald"
        />
        <StatsSummaryCard
          title="จำนวนออร์เดอร์ทั้งหมด"
          value={`${stats.totalOrders} บิล`}
          subtitle="รวมทุกรอบการสั่งอาหาร"
          icon={ShoppingBag}
          color="red"
        />
        <StatsSummaryCard
          title="โต๊ะที่กำลังใช้งาน"
          value={`${stats.activeTablesCount} / ${tables.length} โต๊ะ`}
          subtitle="สถานะมีลูกค้า / เรียกพนักงาน / เช็กบิล"
          icon={Users}
          color="blue"
        />
        <StatsSummaryCard
          title="เมนูพร้อมจำหน่าย"
          value={`${stats.availableMenusCount} / ${menus.length} เมนู`}
          subtitle="จำนวนเมนูที่เปิดให้ลูกค้าสั่งได้"
          icon={Utensils}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* อันดับเมนูขายดี 5 อันดับแรก */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-base text-slate-900">
              5 อันดับเมนูสุกี้ขายดี
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-6 text-center">กำลังคำนวณสถิติ...</p>
          ) : topSellingItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              ยังไม่มีข้อมูลการสั่งอาหาร
            </p>
          ) : (
            <div className="space-y-3">
              {topSellingItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        สั่งรวม {item.quantity} ถาด
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-emerald-600">
                    ฿{item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ระบบจัดการโต๊ะด่วน */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">
              ระบบจัดการสถานะโต๊ะ (A01 – A08)
            </h2>
            <span className="text-xs text-slate-400">คลิกเพื่อสลับ โต๊ะว่าง / มีลูกค้า</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tables.map((t) => {
              const isFree = t.status === 'available'
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border text-center space-y-2 ${
                    isFree
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">โต๊ะ {t.tableNo}</div>
                  <div
                    className={`text-[11px] font-semibold ${
                      isFree ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {isFree ? 'ว่าง' : `ไม่ว่าง (${t.status})`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleTableStatus(t)}
                    className="w-full py-1 px-2 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isFree ? 'เปิดโต๊ะ' : 'เคลียร์โต๊ะ'}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ประวัติออร์เดอร์ทั้งหมดในระบบ พร้อมตัวกรองโต๊ะและสถานะ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-base text-slate-900">
            ประวัติออร์เดอร์ทั้งหมด ({filteredHistoryOrders.length} รายการ)
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={historyTableFilter}
              onChange={(e) => setHistoryTableFilter(e.target.value)}
              aria-label="กรองประวัติตามโต๊ะ"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">ทุกโต๊ะ</option>
              {tables.map((t) => (
                <option key={t.id} value={t.tableNo}>
                  โต๊ะ {t.tableNo}
                </option>
              ))}
            </select>

            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              aria-label="กรองประวัติตามสถานะ"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอรับออร์เดอร์</option>
              <option value="preparing">กำลังเตรียมอาหาร</option>
              <option value="served">เสิร์ฟแล้ว</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-2.5 px-3">รหัสบิล</th>
                <th className="py-2.5 px-3">โต๊ะ</th>
                <th className="py-2.5 px-3">รายการอาหาร</th>
                <th className="py-2.5 px-3">สถานะ</th>
                <th className="py-2.5 px-3 text-right">ยอดรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistoryOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    ไม่พบรายการออร์เดอร์ตามตัวกรองที่เลือก
                  </td>
                </tr>
              ) : (
                filteredHistoryOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-3 font-semibold">#{o.id}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                        {o.tableNo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {o.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-red-600">
                      ฿{o.totalPrice}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
