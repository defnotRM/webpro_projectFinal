import { Clock, Flame, CheckCircle2 } from 'lucide-react'

/**
 * [คนที่ 2 รับผิดชอบ]
 * Component 5: OrderStatusBadge - ป้ายแสดงสถานะออร์เดอร์ (รอรับออร์เดอร์ -> กำลังเตรียมอาหาร -> เสิร์ฟแล้ว)
 */
export default function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: 'รอรับออร์เดอร์',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Clock
    },
    preparing: {
      label: 'กำลังเตรียมอาหาร',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Flame
    },
    served: {
      label: 'เสิร์ฟแล้ว',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: CheckCircle2
    }
  }

  const current = statusConfig[status] || statusConfig.pending
  const Icon = current.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  )
}
