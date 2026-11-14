import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  Heart,
  ShoppingBag,
  ArrowUpDown,
  ClipboardList,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useOrder } from '../context/OrderContext'
import { getMenus } from '../services/sukiApi'
import MenuCard from '../components/MenuCard'

const CATEGORIES = ['ทั้งหมด', 'เมนูโปรด', 'เนื้อหมู', 'เนื้อวัว', 'ซีฟู้ด', 'ผัก', 'ลูกชิ้น', 'น้ำซุป', 'เครื่องดื่ม']

/**
 * [คนที่ 1 รับผิดชอบ]
 * Page 2: MenuOrderPage (/menu) - หน้าแสดงรายการอาหารสุกี้ ค้นหา กรองหมวดหมู่/เมนูโปรด และเลือกใส่ตะกร้า
 */
export default function MenuOrderPage({ onOpenCart }) {
  const [searchParams] = useSearchParams()
  const {
    selectedTable,
    setSelectedTable,
    favorites,
    cartCount,
    cartTotal
  } = useOrder()

  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State สำหรับการค้นหา กรองหมวดหมู่ และเรียงลำดับราคา
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [sortBy, setSortBy] = useState('recommended')

  // หากลูกค้าสแกน QR Code เข้ามาผ่าน URL เช่น /menu?table=A05 ให้ตั้งค่าโต๊ะตาม URL อัตโนมัติ
  useEffect(() => {
    const tableFromUrl = searchParams.get('table')
    if (tableFromUrl && tableFromUrl.trim() !== '') {
      setSelectedTable(tableFromUrl.trim().toUpperCase())
    }
  }, [searchParams, setSelectedTable])

  const fetchMenuData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMenus()
      setMenus(data)
    } catch (err) {
      setError('ไม่สามารถโหลดรายการอาหารจากระบบกลางได้ กรุณาตรวจสอบว่ารัน npm run api แล้ว')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuData()
  }, [])

  // กรองเมนูด้วยคำค้นหา + หมวดหมู่ + เมนูโปรด และเรียงลำดับราคาด้วย useMemo
  const filteredMenus = useMemo(() => {
    return menus
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        if (selectedCategory === 'ทั้งหมด') return true
        if (selectedCategory === 'เมนูโปรด') return favorites.includes(item.id)
        return item.category === selectedCategory
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        return Number(b.recommended) - Number(a.recommended)
      })
  }, [menus, searchQuery, selectedCategory, sortBy, favorites])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6">
      {/* แถบข้อมูลโต๊ะปัจจุบัน และลิงก์ไปดูสถานะออร์เดอร์ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-sm">
              โต๊ะ {selectedTable}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              เลือกเมนูสุกี้และชาบู
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            เลือกเนื้อสัตว์ ผักสด และน้ำซุปลงตะกร้า แล้วกดยืนยันเพื่อส่งรายการเข้าห้องครัวทันที
          </p>
        </div>

        <Link
          to="/my-orders"
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <ClipboardList className="w-4 h-4 text-red-600" />
          <span>ดูสถานะอาหารที่สั่งไปแล้ว</span>
        </Link>
      </div>

      {/* ช่องค้นหาและตัวเรียงลำดับราคา */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเมนู เช่น วากิว, คุโรบูตะ, กุ้งแม่น้ำ, เต้าหู้ชีส..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="เรียงลำดับเมนูอาหาร"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="recommended">แนะนำ / ขายดีก่อน</option>
            <option value="price-asc">ราคา: น้อย → มาก</option>
            <option value="price-desc">ราคา: มาก → น้อย</option>
          </select>
        </div>
      </div>

      {/* ปุ่มกรองหมวดหมู่อาหาร */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category
          const isFavTab = category === 'เมนูโปรด'

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isFavTab && (
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'fill-white text-white' : 'fill-red-500 text-red-500'
                  }`}
                />
              )}
              <span>{category}</span>
              {isFavTab && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {favorites.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* แสดงข้อผิดพลาดกรณี API ไม่ทำงาน */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchMenuData}
            className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> โหลดใหม่
          </button>
        </div>
      )}

      {/* แสดงรายการการ์ดอาหาร */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl bg-slate-200/70 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="font-semibold text-slate-700">ไม่พบเมนูอาหารที่ค้นหา</p>
          <p className="text-xs text-slate-500 mt-1">
            ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ &ldquo;ทั้งหมด&rdquo;
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('ทั้งหมด')
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold cursor-pointer"
          >
            แสดงเมนูทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredMenus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}

      {/* แถบลอยด้านล่างสำหรับกดดูตะกร้าและยืนยันออร์เดอร์ */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-20">
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl flex items-center justify-between gap-4 cursor-pointer border border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-sm">
                {cartCount}
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-300 block">
                  ตะกร้าสั่งอาหาร โต๊ะ {selectedTable}
                </span>
                <span className="font-bold text-base">รวม ฿{cartTotal}</span>
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-red-600 font-semibold text-xs flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>ตรวจสอบและสั่งอาหาร</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
