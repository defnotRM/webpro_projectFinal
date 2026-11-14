const API_BASE_URL = 'http://localhost:3001'

// ============================================================================
// ส่วนที่ 1: API สำหรับฝั่งลูกค้า (คนที่ 1 รับผิดชอบอธิบาย)
// ============================================================================

/**
 * ดึงรายการเมนูอาหารทั้งหมดจากระบบกลาง
 */
export async function getMenus() {
  const response = await fetch(`${API_BASE_URL}/menus`)
  if (!response.ok) {
    throw new Error(`ไม่สามารถดึงข้อมูลเมนูอาหารได้ (${response.status})`)
  }
  return response.json()
}

/**
 * ดึงข้อมูลสถานะโต๊ะทั้งหมด (A01 - A08)
 */
export async function getTables() {
  const response = await fetch(`${API_BASE_URL}/tables`)
  if (!response.ok) {
    throw new Error(`ไม่สามารถดึงข้อมูลโต๊ะได้ (${response.status})`)
  }
  return response.json()
}

/**
 * อัปเดตสถานะของโต๊ะ เช่น ลูกค้าเปิดโต๊ะ (occupied), เรียกพนักงาน (calling), ขอเช็กบิล (billing)
 */
export async function updateTableStatus(tableId, status) {
  const response = await fetch(`${API_BASE_URL}/tables/${tableId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถอัปเดตสถานะโต๊ะได้ (${response.status})`)
  }
  return response.json()
}

/**
 * ลูกค้ากดยืนยันสั่งอาหาร -> บันทึกออร์เดอร์ใหม่ลงระบบกลาง (POST /orders)
 */
export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถส่งออร์เดอร์ได้ (${response.status})`)
  }
  return response.json()
}

/**
 * ดึงรายการออร์เดอร์เฉพาะโต๊ะของลูกค้า (GET /orders?tableNo=A05)
 */
export async function getOrdersByTable(tableNo) {
  const response = await fetch(`${API_BASE_URL}/orders?tableNo=${encodeURIComponent(tableNo)}`)
  if (!response.ok) {
    throw new Error(`ไม่สามารถดึงออร์เดอร์ของโต๊ะ ${tableNo} ได้ (${response.status})`)
  }
  return response.json()
}

// ============================================================================
// ส่วนที่ 2: API สำหรับฝั่งพนักงานครัวและ Admin (คนที่ 2 รับผิดชอบอธิบาย)
// ============================================================================

/**
 * ดึงรายการออร์เดอร์ทั้งหมดในร้านสำหรับหน้าจอห้องครัวและ Dashboard
 */
export async function getAllOrders() {
  const response = await fetch(`${API_BASE_URL}/orders`)
  if (!response.ok) {
    throw new Error(`ไม่สามารถดึงข้อมูลออร์เดอร์ทั้งหมดได้ (${response.status})`)
  }
  return response.json()
}

/**
 * พนักงานเปลี่ยนสถานะออร์เดอร์ (pending -> preparing -> served)
 */
export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถเปลี่ยนสถานะออร์เดอร์ #${orderId} ได้ (${response.status})`)
  }
  return response.json()
}

/**
 * ลบออร์เดอร์ (กรณีเคลียร์บิลหรือยกเลิกรายการผิดพลาด)
 */
export async function deleteOrder(orderId) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถลบออร์เดอร์ #${orderId} ได้ (${response.status})`)
  }
  return response.json()
}

/**
 * Admin เพิ่มเมนูสุกี้ใหม่ (POST /menus)
 */
export async function createMenu(menuData) {
  const response = await fetch(`${API_BASE_URL}/menus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(menuData)
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถเพิ่มเมนูใหม่ได้ (${response.status})`)
  }
  return response.json()
}

/**
 * Admin แก้ไขข้อมูลเมนูอาหาร (PUT /menus/:id)
 */
export async function updateMenu(id, menuData) {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(menuData)
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถแก้ไขเมนู #${id} ได้ (${response.status})`)
  }
  return response.json()
}

/**
 * Admin สลับสถานะพร้อมขาย / สินค้าหมดชั่วคราว (PATCH /menus/:id)
 */
export async function toggleMenuAvailability(id, available) {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ available })
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถเปลี่ยนสถานะเมนู #${id} ได้ (${response.status})`)
  }
  return response.json()
}

/**
 * Admin ลบเมนูอาหารออกจากระบบ (DELETE /menus/:id)
 */
export async function deleteMenu(id) {
  const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    throw new Error(`ไม่สามารถลบเมนู #${id} ได้ (${response.status})`)
  }
  return response.json()
}
