import { useEffect, useRef, useState } from 'react'
import { X, Save, AlertCircle, Image as ImageIcon } from 'lucide-react'

const CATEGORIES = ['เนื้อหมู', 'เนื้อวัว', 'ซีฟู้ด', 'ผัก', 'ลูกชิ้น', 'น้ำซุป', 'เครื่องดื่ม']

const DEFAULT_FORM = {
  name: '',
  category: 'เนื้อหมู',
  price: '',
  description: '',
  image: '',
  available: true,
  recommended: false
}

/**
 * [คนที่ 2 รับผิดชอบ]
 * Component 7: MenuFormModal - ฟอร์ม Modal สำหรับเพิ่มและแก้ไขเมนูสุกี้ พร้อมระบบตรวจสอบข้อมูล (Validation)
 */
export default function MenuFormModal({
  isOpen,
  onClose,
  onSave,
  editingMenu,
  existingMenus = []
}) {
  const dialogRef = useRef(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [imagePreviewError, setImagePreviewError] = useState(false)

  useEffect(() => {
    if (editingMenu) {
      setFormData({
        name: editingMenu.name || '',
        category: editingMenu.category || 'เนื้อหมู',
        price: String(editingMenu.price ?? ''),
        description: editingMenu.description || '',
        image: editingMenu.image || '',
        available: editingMenu.available ?? true,
        recommended: editingMenu.recommended ?? false
      })
    } else {
      setFormData(DEFAULT_FORM)
    }
    setErrors({})
    setImagePreviewError(false)
  }, [editingMenu, isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  // ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก (Validation & Error Handling 5 คะแนน)
  const validate = () => {
    const newErrors = {}
    const trimmedName = formData.name.trim()
    if (!trimmedName) {
      newErrors.name = 'กรุณาระบุชื่อเมนูอาหาร'
    } else {
      const isDuplicate = existingMenus.some(
        (m) =>
          m.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
          m.id !== editingMenu?.id
      )
      if (isDuplicate) {
        newErrors.name = 'มีชื่อเมนูอาหารนี้ในระบบแล้ว กรุณาใช้ชื่ออื่น'
      }
    }

    const numericPrice = Number(formData.price)
    if (!formData.price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      newErrors.price = 'กรุณาระบุราคาเป็นตัวเลขที่มากกว่า 0'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'กรุณาระบุคำอธิบายเมนูสั้นๆ'
    }

    const trimmedImage = formData.image.trim()
    if (!trimmedImage) {
      newErrors.image = 'กรุณาระบุลิงก์รูปภาพ (URL)'
    } else if (!/^https?:\/\/.+/i.test(trimmedImage)) {
      newErrors.image = 'ลิงก์รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving || !validate()) return

    try {
      setSaving(true)
      await onSave({
        ...formData,
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        image: formData.image.trim()
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const hasValidImageUrl = /^https?:\/\/.+/i.test(formData.image.trim())

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        if (saving) event.preventDefault()
      }}
      aria-labelledby="menu-form-modal-title"
      className="m-auto w-full max-w-lg rounded-2xl bg-white p-0 text-slate-800 shadow-2xl border border-slate-200"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 id="menu-form-modal-title" className="font-bold text-base text-slate-900">
            {editingMenu ? `แก้ไขเมนู: ${editingMenu.name}` : 'เพิ่มเมนูสุกี้ใหม่'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="ปิดหน้าต่างฟอร์มเมนู"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* ชื่อเมนู */}
          <div>
            <label
              htmlFor="menu-name-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              ชื่อเมนูอาหาร <span className="text-red-500">*</span>
            </label>
            <input
              id="menu-name-input"
              type="text"
              disabled={saving}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น สันคอหมูสไลซ์คุโรบูตะ"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* หมวดหมู่ และ ราคา */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="menu-category-select"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                id="menu-category-select"
                disabled={saving}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="menu-price-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                ราคา (บาท / ถาด) <span className="text-red-500">*</span>
              </label>
              <input
                id="menu-price-input"
                type="number"
                min="1"
                disabled={saving}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="เช่น 79"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {errors.price && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.price}
                </p>
              )}
            </div>
          </div>

          {/* ลิงก์รูปภาพ + ตัวอย่างรูปภาพ */}
          <div>
            <label
              htmlFor="menu-image-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              URL รูปภาพอาหาร <span className="text-red-500">*</span>
            </label>
            <input
              id="menu-image-input"
              type="url"
              disabled={saving}
              value={formData.image}
              onChange={(e) => {
                setImagePreviewError(false)
                setFormData({ ...formData, image: e.target.value })
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.image && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.image}
              </p>
            )}

            {hasValidImageUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                {!imagePreviewError ? (
                  <img
                    src={formData.image.trim()}
                    alt="ตัวอย่างรูปเมนู"
                    onError={() => setImagePreviewError(true)}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="text-xs text-slate-600">
                  <span className="font-semibold block text-slate-800">
                    ตัวอย่างรูปภาพเมนู
                  </span>
                  <span>
                    {imagePreviewError
                      ? 'ไม่สามารถโหลดรูปจากลิงก์นี้ได้ กรุณาตรวจสอบ URL'
                      : 'รูปภาพพร้อมแสดงผลบนหน้าเมนู'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* รายละเอียดอาหาร */}
          <div>
            <label
              htmlFor="menu-desc-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              รายละเอียดเมนู <span className="text-red-500">*</span>
            </label>
            <textarea
              id="menu-desc-input"
              rows={2}
              disabled={saving}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="อธิบายจุดเด่นของวัตถุดิบ..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
              </p>
            )}
          </div>

          {/* ตัวเลือกสถานะพร้อมขาย และ เมนูขายดี */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                disabled={saving}
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span>พร้อมจำหน่าย (มีของ)</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                disabled={saving}
                checked={formData.recommended}
                onChange={(e) =>
                  setFormData({ ...formData, recommended: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <span>ติดป้ายเมนูแนะนำ (ขายดี)</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-sm font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
