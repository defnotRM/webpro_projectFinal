/**
 * [คนที่ 2 รับผิดชอบ]
 * Component 8: StatsSummaryCard - การ์ดแสดงผลสถิติสรุปยอดขายและข้อมูลสำคัญบนหน้า Admin Dashboard
 */
export default function StatsSummaryCard({ title, value, subtitle, icon: Icon, color = 'red' }) {
  const colorMap = {
    red: 'bg-red-50 text-red-600 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100'
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
            colorMap[color] || colorMap.red
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}
