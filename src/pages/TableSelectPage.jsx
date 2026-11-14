import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QrCode,
  Users,
  BellRing,
  Receipt,
  UtensilsCrossed,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'
import { getTables, updateTableStatus } from '../services/sukiApi'
import TableQRModal from '../components/TableQRModal'

/**
 * [คนที่ 1 รับผิดชอบ]
 * Page 1: TableSelectPage (/) - หน้าเลือกโต๊ะ สแกน QR Code ประจำโต๊ะ และปุ่มเรียกพนักงาน/แจ้งเช็กบิล
 */
export default function TableSelectPage() {
  const navigate = useNavigate()
  const { selectedTable, setSelectedTable, showToast } = useOrder()

  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [qrModalTable, setQrModalTable] = useState(null)

  const fetchTablesData = async () => {
    try {
      setError(null)
      const data = await getTables()
      setTables(data)
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อ JSON Server พอร์ต 3001 ได้ กรุณารันคำสั่ง npm run api')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTablesData()
    const timer = setInterval(fetchTablesData, 4000)
    return () => clearInterval(timer)
  }, [])

  // กรองโต๊ะตามสถานะ
  const filteredTables = useMemo(() => {
    if (statusFilter === 'all') return tables
    return tables.filter((t) => t.status === statusFilter)
  }, [tables, statusFilter])

  const currentTableObj = tables.find((t) => t.tableNo === selectedTable)

  const handleChooseTable = (tableNo) => {
    setSelectedTable(tableNo)
    showToast(`เลือกนั่งที่ โต๊ะ ${tableNo} เรียบร้อยแล้ว`)
    navigate(`/menu?table=${tableNo}`)
  }

  const handleTableAction = async (newStatus, actionLabel) => {
    if (!currentTableObj) return
    try {
      await updateTableStatus(currentTableObj.id, newStatus)
      showToast(`โต๊ะ ${selectedTable}: ${actionLabel}สำเร็จ พนักงานกำลังดำเนินการครับ`)
      fetchTablesData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const statusBadgeMap = {
    available: {
      label: 'โต๊ะว่าง',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500'
    },
    occupied: {
      label: 'มีลูกค้ากำลังทาน',
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
      dot: 'bg-blue-500'
    },
    calling: {
      label: 'เรียกพนักงาน',
      bg: 'bg-amber-50 border-amber-300 text-amber-800',
      dot: 'bg-amber-500 animate-ping'
    },
    billing: {
      label: 'รอเช็กบิล',
      bg: 'bg-purple-50 border-purple-300 text-purple-800',
      dot: 'bg-purple-500 animate-ping'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* แบนเนอร์ต้อนรับและแสดงโต๊ะที่กำลังเลือก */}
      <div className="rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-orange-500 text-white p-6 sm:p-8 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
            ระบบสั่งอาหารร้านสุกี้ด้วย QR Code ประจำโต๊ะ
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ยินดีต้อนรับสู่ SUKI HOTPOT
          </h1>
          <p className="text-sm text-red-100 leading-relaxed">
            เลือกหมายเลขโต๊ะของคุณ หรือสแกน QR Code ประจำโต๊ะเพื่อดูเมนูสุกี้ สั่งอาหารเข้าห้องครัวโดยตรง และติดตามสถานะอาหารแบบ Real-time
          </p>
        </div>

        {/* กล่องควบคุมด่วนสำหรับโต๊ะปัจจุบัน */}
        <div className="w-full lg:w-auto bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 min-w-72">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-100">โต๊ะปัจจุบันของคุณ</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 font-bold text-sm">
              โต๊ะ {selectedTable}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleTableAction('calling', 'ส่งสัญญาณเรียกพนักงาน')}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>เรียกพนักงาน</span>
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('billing', 'แจ้งขอเช็กบิล')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>ขอเช็กบิล</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/menu?table=${selectedTable}`)}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>เปิดเมนูสั่งอาหาร โต๊ะ {selectedTable}</span>
          </button>
        </div>
      </div>

      {/* แจ้งเตือนกรณีลืมเปิด JSON Server */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchTablesData}
            className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> ลองใหม่
          </button>
        </div>
      )}

      {/* ส่วนกรองสถานะโต๊ะ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">ผังโต๊ะภายในร้าน (A01 – A08)</h2>
          <p className="text-xs text-slate-500">
            คลิกเลือกโต๊ะเพื่อจำลองการนั่งประจำโต๊ะ หรือกดปุ่ม QR Code เพื่อสแกนเข้าโต๊ะนั้น
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'available', label: 'โต๊ะว่าง' },
            { id: 'occupied', label: 'มีลูกค้า' },
            { id: 'calling', label: 'เรียกพนักงาน' },
            { id: 'billing', label: 'รอเช็กบิล' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ตารางแสดงการ์ดโต๊ะ */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-slate-200/70 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const isSelected = table.tableNo === selectedTable
            const badge = statusBadgeMap[table.status] || statusBadgeMap.available

            return (
              <div
                key={table.id}
                className={`rounded-2xl bg-white p-5 border-2 transition-all flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-red-600 ring-4 ring-red-600/10 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-900">
                        โต๊ะ {table.tableNo}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> เลือกอยู่
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Users className="w-3.5 h-3.5" /> รองรับ {table.seats} ที่นั่ง
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleChooseTable(table.tableNo)}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>สั่งอาหารโต๊ะนี้</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQrModalTable(table.tableNo)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title={`แสดง QR Code โต๊ะ ${table.tableNo}`}
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal แสดง QR Code เฉพาะโต๊ะที่คลิก */}
      <TableQRModal
        isOpen={Boolean(qrModalTable)}
        tableNo={qrModalTable}
        onClose={() => setQrModalTable(null)}
      />
    </div>
  )
}
