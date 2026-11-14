import { useEffect, useRef } from 'react'
import { QrCode, ExternalLink, X, Copy } from 'lucide-react'
import { useOrder } from '../context/OrderContext'

/**
 * [คนที่ 1 รับผิดชอบ]
 * Component 4: TableQRModal - หน้าต่างแสดง QR Code ประจำโต๊ะและ URL สำหรับสแกนสั่งอาหาร
 */
export default function TableQRModal({ isOpen, onClose, tableNo }) {
  const dialogRef = useRef(null)
  const { selectedTable, showToast } = useOrder()

  const activeTable = tableNo || selectedTable
  const tableUrl = `${window.location.origin}/menu?table=${activeTable}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    tableUrl
  )}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(tableUrl)
    showToast(`คัดลอกลิงก์สำหรับโต๊ะ ${activeTable} แล้ว`)
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="qr-modal-title"
      className="m-auto w-full max-w-sm rounded-2xl bg-white p-6 text-slate-800 shadow-2xl border border-slate-200"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-red-600" />
          <h2 id="qr-modal-title" className="font-bold text-base text-slate-900">
            QR Code ประจำโต๊ะ {activeTable}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง QR Code"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="py-5 text-center space-y-4">
        <div className="inline-block p-4 bg-white border-2 border-dashed border-red-200 rounded-2xl shadow-xs">
          <img
            src={qrImageUrl}
            alt={`QR Code สำหรับโต๊ะ ${activeTable}`}
            className="w-48 h-48 mx-auto"
          />
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold text-sm">
            หมายเลขโต๊ะ: {activeTable}
          </span>
          <p className="text-xs text-slate-500 mt-2">
            ลูกค้าสามารถสแกน QR Code นี้ หรือเปิด URL ด้านล่างเพื่อเข้าสั่งอาหารของโต๊ะ{' '}
            <strong>{activeTable}</strong> ได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs text-slate-600">
          <span className="truncate flex-1 text-left font-mono">{tableUrl}</span>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer"
            title="คัดลอก URL"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <a
          href={`/menu?table=${activeTable}`}
          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
        >
          <ExternalLink className="w-4 h-4" />
          <span>จำลองเปิดลิงก์สั่งอาหารโต๊ะ {activeTable}</span>
        </a>
      </div>
    </dialog>
  )
}
