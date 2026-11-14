import { Heart, Plus, Sparkles, Ban } from 'lucide-react'
import { useOrder } from '../context/OrderContext'

/**
 * [คนที่ 1 รับผิดชอบ]
 * Component 2: MenuCard - การ์ดแสดงรายการอาหารสุกี้แต่ละจาน พร้อมปุ่มบันทึกเมนูโปรดและเพิ่มลงตะกร้า
 */
export default function MenuCard({ menu }) {
  const { addToCart, favorites, toggleFavorite, cart } = useOrder()

  const isFavorite = favorites.includes(menu.id)
  const itemInCart = cart.find((item) => item.menuId === menu.id)

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col">
      {/* ส่วนรูปภาพเมนูและป้ายกำกับ */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={menu.image}
          alt={menu.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            !menu.available ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />

        {/* หมวดหมู่ */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/75 text-white backdrop-blur-xs">
          {menu.category}
        </span>

        {/* ป้ายแนะนำ */}
        {menu.recommended && menu.available && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            ขายดี
          </span>
        )}

        {/* ปุ่มกดหัวใจ เมนูโปรด (Favorite) */}
        <button
          type="button"
          onClick={() => toggleFavorite(menu.id)}
          aria-label={isFavorite ? 'นำออกจากเมนูโปรด' : 'เพิ่มเป็นเมนูโปรด'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            isFavorite
              ? 'bg-red-500 text-white scale-105'
              : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* กรณีสินค้าหมดชั่วคราว */}
        {!menu.available && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm">
              <Ban className="w-4 h-4" />
              สินค้าหมดชั่วคราว
            </span>
          </div>
        )}
      </div>

      {/* รายละเอียดอาหาร */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-base line-clamp-1">
            {menu.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {menu.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-lg font-bold text-red-600">฿{menu.price}</span>
            <span className="text-xs text-slate-400 ml-1">/ ถาด</span>
          </div>

          <button
            type="button"
            disabled={!menu.available}
            onClick={() => addToCart(menu, 1)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              menu.available
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {itemInCart ? `เพิ่มอีก (${itemInCart.quantity})` : 'ใส่ตะกร้า'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
