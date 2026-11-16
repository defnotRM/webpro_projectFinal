import { useState } from 'react'
import { Clock, ChefHat, CheckCircle2, Trash2, MessageSquare, X } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'

/**
 * [คนที่ 2 รับผิดชอบ]
 * Component 6: OrderTicketCard - การ์ดใบออร์เดอร์สำหรับพนักงานห้องครัว กดเปลี่ยนสถานะตามลำดับขั้นตอน
 */
export default function OrderTicketCard({
  order,
  onUpdateStatus,
  onDeleteOrder,
  isBusy = false
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const totalItemsCount = (order.items || []).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* ส่วนหัวใบออร์เดอร์ */}
      <div>
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-bold text-sm">
              โต๊ะ {order.tableNo}
            </span>
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                Order #{order.id} ({totalItemsCount} ถาด)
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formattedTime} น.
              </span>
            </div>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {/* รายการอาหารในใบออร์เดอร์ */}
        <div className="p-5 space-y-2.5">
          {order.items?.map((item, idx) => (
            <div
              key={`${order.id}-${item.menuId || idx}`}
              className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 last:border-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center shrink-0">
                  x{item.quantity}
                </span>
                <span className="font-medium text-slate-800 truncate">{item.name}</span>
              </div>
              <span className="text-xs text-slate-500 shrink-0">
                ฿{item.price * item.quantity}
              </span>
            </div>
          ))}

          {/* หมายเหตุจากลูกค้า */}
          {order.note && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>หมายเหตุ:</strong> {order.note}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ส่วนท้าย: ยอดรวมและปุ่มกดเปลี่ยนสถานะออร์เดอร์ */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-xs text-slate-400 block">ยอดรวมออร์เดอร์</span>
          <span className="font-bold text-base text-slate-900">฿{order.totalPrice}</span>
        </div>

        {confirmingDelete ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                setConfirmingDelete(false)
                onDeleteOrder(order.id)
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-semibold cursor-pointer"
            >
              ยืนยันลบ
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setConfirmingDelete(false)}
              aria-label="ยกเลิกการลบ"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {order.status === 'pending' && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                <ChefHat className="w-4 h-4" />
                <span>{isBusy ? 'กำลังบันทึก...' : 'รับออร์เดอร์ / เตรียมอาหาร'}</span>
              </button>
            )}

            {order.status === 'preparing' && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onUpdateStatus(order.id, 'served')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isBusy ? 'กำลังบันทึก...' : 'เสิร์ฟอาหารแล้ว'}</span>
              </button>
            )}

            {order.status === 'served' && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-medium cursor-pointer"
              >
                ย้อนสถานะ
              </button>
            )}

            <button
              type="button"
              disabled={isBusy}
              onClick={() => setConfirmingDelete(true)}
              aria-label={`ลบออร์เดอร์ #${order.id}`}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
              title="ลบรายการออร์เดอร์"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
