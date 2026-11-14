import { useEffect, useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  Ban,
  Sparkles,
  AlertTriangle
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuAvailability
} from '../services/sukiApi'
import MenuFormModal from '../components/MenuFormModal'

const CATEGORIES = ['ทั้งหมด', 'เนื้อหมู', 'เนื้อวัว', 'ซีฟู้ด', 'ผัก', 'ลูกชิ้น', 'น้ำซุป', 'เครื่องดื่ม']

/**
 * [คนที่ 2 รับผิดชอบ]
 * Page 5: AdminMenuPage (/admin/menus) - หน้าจัดการเมนูอาหารสำหรับผู้ดูแลระบบ (CRUD: เพิ่ม / แก้ไข / ลบ / สลับสถานะพร้อมขาย)
 */
export default function AdminMenuPage() {
  const { showToast } = useOrder()

  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State สำหรับค้นหาและกรองเมนูหลังบ้าน
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด')

  // State สำหรับเปิด/ปิด Modal เพิ่มหรือแก้ไขเมนู
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)

  const fetchMenus = async () => {
    try {
      setError(null)
      const data = await getMenus()
      setMenus(data)
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลเมนูอาหารได้ กรุณาตรวจสอบว่ารัน npm run api แล้ว')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  // กรองเมนูตามคำค้นหาและหมวดหมู่
  const filteredMenus = useMemo(() => {
    return menus.filter((item) => {
      const matchCat =
        categoryFilter === 'ทั้งหมด' || item.category === categoryFilter
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [menus, searchQuery, categoryFilter])

  // บันทึกเมนูใหม่ หรือ แก้ไขเมนูเดิม (POST / PUT)
  const handleSaveMenu = async (menuData) => {
    try {
      if (editingMenu) {
        await updateMenu(editingMenu.id, { ...editingMenu, ...menuData })
        showToast(`แก้ไขเมนู "${menuData.name}" เรียบร้อยแล้ว`)
      } else {
        await createMenu(menuData)
        showToast(`เพิ่มเมนูใหม่ "${menuData.name}" เรียบร้อยแล้ว`)
      }
      fetchMenus()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // สลับสถานะ มีของ / สินค้าหมดชั่วคราว (PATCH)
  const handleToggleAvailable = async (menu) => {
    try {
      await toggleMenuAvailability(menu.id, !menu.available)
      showToast(
        `เปลี่ยนสถานะ "${menu.name}" เป็น ${
          !menu.available ? 'พร้อมขาย' : 'สินค้าหมดชั่วคราว'
        }`
      )
      fetchMenus()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // ลบเมนูอาหารออกจากระบบ (DELETE)
  const handleDeleteMenu = async (menu) => {
    try {
      await deleteMenu(menu.id)
      showToast(`ลบเมนู "${menu.name}" ออกจากระบบแล้ว`, 'info')
      fetchMenus()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ส่วนหัวและปุ่มเพิ่มเมนูใหม่ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการรายการเมนูอาหาร (Menu CRUD Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            เพิ่มเมนูสุกี้ใหม่ แก้ไขราคา/รูปภาพ ปรับสถานะสินค้าหมดชั่วคราว หรือลบรายการอาหาร
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMenu(null)
            setIsModalOpen(true)
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเมนูอาหารใหม่</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* แถบค้นหาและตัวกรองหมวดหมู่ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อเมนูอาหาร..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* ตารางแสดงรายการเมนูอาหาร */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3.5 px-4">เมนูอาหาร</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4">ราคา</th>
                <th className="py-3.5 px-4">สถานะจำหน่าย</th>
                <th className="py-3.5 px-4 text-right">จัดการ (แก้ไข / ลบ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                    กำลังโหลดข้อมูลเมนูอาหาร...
                  </td>
                </tr>
              ) : filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 text-xs">
                    ไม่พบรายการเมนูที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredMenus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={menu.image}
                          alt={menu.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{menu.name}</span>
                            {menu.recommended && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800 font-semibold">
                                <Sparkles className="w-3 h-3" /> ขายดี
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                            {menu.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {menu.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-red-600">฿{menu.price}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailable(menu)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          menu.available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {menu.available ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมขาย
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" /> สินค้าหมด
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMenu(menu)
                            setIsModalOpen(true)
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMenu(menu)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="ลบเมนู"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ฟอร์มเพิ่ม/แก้ไขเมนูอาหาร */}
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMenu}
        editingMenu={editingMenu}
      />
    </div>
  )
}
