import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const OrderContext = createContext(null)

/**
 * OrderProvider: จัดการ State กลางของฝั่งลูกค้า (โต๊ะที่เลือก, ตะกร้าสั่งอาหาร, รายการโปรด, และ Toast แจ้งเตือน)
 * [คนที่ 1 รับผิดชอบหลักในการอธิบาย Context & State Management]
 */
export function OrderProvider({ children }) {
  // 1. หมายเลขโต๊ะปัจจุบัน (ค่าเริ่มต้น A05 ตามโจทย์)
  const [selectedTable, setSelectedTable] = useState(() => {
    return localStorage.getItem('suki_selected_table') || 'A05'
  })

  // 2. รายการอาหารในตะกร้า (ยังไม่กดส่งเข้าครัว)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('suki_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 3. รายการเมนูโปรด (Favorites) เก็บเป็น Array ของ menuId
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('suki_favorites')
      return saved ? JSON.parse(saved) : [1, 3, 9]
    } catch {
      return [1, 3, 9]
    }
  })

  // 4. ระบบแจ้งเตือน Toast
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev))
    }, 3000)
  }

  // บันทึกค่าลง localStorage อัตโนมัติเมื่อ State เปลี่ยน
  useEffect(() => {
    localStorage.setItem('suki_selected_table', selectedTable)
  }, [selectedTable])

  useEffect(() => {
    localStorage.setItem('suki_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('suki_favorites', JSON.stringify(favorites))
  }, [favorites])

  // ฟังก์ชันเพิ่มอาหารลงตะกร้า
  const addToCart = (menuItem, quantity = 1) => {
    if (!menuItem.available) {
      showToast(`ขออภัย เมนู "${menuItem.name}" สินค้าหมดชั่วคราว`, 'error')
      return
    }
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.menuId === menuItem.id)
      if (existingIndex > -1) {
        const updated = [...prevCart]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        }
        return updated
      }
      return [
        ...prevCart,
        {
          menuId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          category: menuItem.category,
          quantity
        }
      ]
    })
    showToast(`เพิ่ม "${menuItem.name}" ลงตะกร้าแล้ว`)
  }

  // ฟังก์ชันปรับลด/เพิ่มจำนวนในตะกร้า
  const updateCartQuantity = (menuId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(menuId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menuId === menuId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  // ฟังก์ชันลบรายการออกจากตะกร้า
  const removeFromCart = (menuId) => {
    setCart((prevCart) => prevCart.filter((item) => item.menuId !== menuId))
    showToast('ลบรายการออกจากตะกร้าแล้ว', 'info')
  }

  // ล้างตะกร้าหลังกดยืนยันสั่งอาหารสำเร็จ
  const clearCart = () => {
    setCart([])
  }

  // สลับการบันทึกเมนูโปรด (Favorite Toggle)
  const toggleFavorite = (menuId) => {
    setFavorites((prev) => {
      const exists = prev.includes(menuId)
      if (exists) {
        showToast('นำออกจากเมนูโปรดแล้ว', 'info')
        return prev.filter((id) => id !== menuId)
      } else {
        showToast('บันทึกเป็นเมนูโปรดแล้ว')
        return [...prev, menuId]
      }
    })
  }

  // คำนวณจำนวนชิ้นรวมและราคารวมในตะกร้าด้วย useMemo
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  return (
    <OrderContext.Provider
      value={{
        selectedTable,
        setSelectedTable,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        favorites,
        toggleFavorite,
        toast,
        showToast
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}
