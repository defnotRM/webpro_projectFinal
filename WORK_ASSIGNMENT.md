# การแบ่งงานโปรเจกต์ 2 คน และคู่มือเตรียมตอบคำถามอาจารย์ (WORK ASSIGNMENT)

เอกสารนี้ออกแบบมาเพื่อให้สมาชิกทั้ง **2 คน** แบ่งความรับผิดชอบไฟล์กันอย่างชัดเจน **ไม่เกิดปัญหาโค้ดชนกัน (Git Merge Conflict)** และช่วยให้แต่ละคนเตรียมตัวนำเสนอรวมถึงตอบคำถามรายบุคคลได้ครบทุกเกณฑ์ (100 คะแนน)

---

## 1. ตารางสรุปการแบ่งไฟล์รับผิดชอบ

| หมวดหมู่ | คนที่ 1: ฝั่งหน้าร้านลูกค้า (Customer Flow) | คนที่ 2: ฝั่งห้องครัว & Admin (Staff/Admin Flow) |
| :--- | :--- | :--- |
| **หน้าที่หลัก** | เลือกโต๊ะ, สแกน QR, ค้นหาเมนู, ตะกร้าสินค้า, เมนูโปรด, ติดตามสถานะอาหาร | รับออร์เดอร์เข้าครัว, เปลี่ยนสถานะเสิร์ฟ, เคลียร์โต๊ะ, CRUD เมนูอาหาร, Dashboard สถิติ |
| **Pages (คนละ 3 หน้า)** | 1. `src/pages/TableSelectPage.jsx` (`/`)<br>2. `src/pages/MenuOrderPage.jsx` (`/menu`)<br>3. `src/pages/CustomerStatusPage.jsx` (`/my-orders`) | 4. `src/pages/StaffOrdersPage.jsx` (`/staff/orders`)<br>5. `src/pages/AdminMenuPage.jsx` (`/admin/menus`)<br>6. `src/pages/AdminDashboardPage.jsx` (`/admin/dashboard`) |
| **Components (คนละ 4 ชิ้น)** | 1. `src/components/Navbar.jsx`<br>2. `src/components/MenuCard.jsx`<br>3. `src/components/CartModal.jsx`<br>4. `src/components/TableQRModal.jsx` | 5. `src/components/OrderStatusBadge.jsx`<br>6. `src/components/OrderTicketCard.jsx`<br>7. `src/components/MenuFormModal.jsx`<br>8. `src/components/StatsSummaryCard.jsx` |
| **State / Context** | `src/context/OrderContext.jsx` (จัดการ `selectedTable`, `cart`, `favorites`, `localStorage`) | Local State & Derived State ในหน้า Staff/Admin (`orders`, `menus`, `tables`, Form Validation) |
| **API (`src/services/sukiApi.js`)** | ส่วนที่ 1: `getMenus`, `getTables`, `updateTableStatus`, `createOrder`, `getOrdersByTable` | ส่วนที่ 2: `getAllOrders`, `updateOrderStatus`, `deleteOrder`, `createMenu`, `updateMenu`, `toggleMenuAvailability`, `deleteMenu` |

---

## 2. รายละเอียดงานและจุดที่ต้องอธิบายได้ของ 【คนที่ 1: ฝั่งลูกค้า】

### ไฟล์ที่รับผิดชอบโดยตรง
1. **`src/context/OrderContext.jsx`**
   - ใช้ `createContext` และ `useContext` เพื่อแชร์ข้อมูลเลขโต๊ะปัจจุบัน (`selectedTable`), รายการในตะกร้า (`cart`), และรายการเมนูโปรด (`favorites`) ไปยังทุกหน้า
   - ใช้ `useEffect` ซิงค์ข้อมูลตะกร้าและเมนูโปรดลง `localStorage` เพื่อให้รีเฟรชหน้าเว็บแล้วของในตะกร้าไม่หาย
   - ใช้ `useMemo` คำนวณจำนวนชิ้นรวม (`cartCount`) และราคารวม (`cartTotal`)
2. **`src/pages/TableSelectPage.jsx`**
   - ดึงสถานะโต๊ะทั้งหมดจาก `getTables()` และกรองโต๊ะตามสถานะ (`โต๊ะว่าง`, `มีลูกค้า`, `เรียกพนักงาน`, `รอเช็กบิล`)
   - มีปุ่มส่งคำขอ **เรียกพนักงาน (`calling`)** และ **ขอเช็กบิล (`billing`)** ผ่าน `PATCH /tables/:id`
3. **`src/pages/MenuOrderPage.jsx`**
   - อ่านค่า Query Parameter `?table=A05` ด้วย `useSearchParams()` (รองรับเวลาสแกน QR Code ประจำโต๊ะ)
   - มีระบบ **ค้นหาชื่อ/คำอธิบายอาหาร**, **กรองตามหมวดหมู่**, **กรองเฉพาะเมนูโปรด (Favorites)** และ **เรียงลำดับตามราคา** โดยคำนวณผ่าน `useMemo`
4. **`src/pages/CustomerStatusPage.jsx`**
   - ดึงเฉพาะออร์เดอร์ของโต๊ะตัวเองด้วย `getOrdersByTable(selectedTable)`
   - ใช้ `useEffect` คู่กับ `setInterval` (Polling ทุก 2.5 วินาที) เพื่อให้เมื่อห้องครัวกดเปลี่ยนสถานะ หน้าจอลูกค้าจะขยับแถบสถานะ (`1. รอรับออร์เดอร์` → `2. กำลังเตรียมอาหาร` → `3. เสิร์ฟแล้ว`) ทันทีโดยไม่ต้องกดรีเฟรช
5. **`src/components/CartModal.jsx` & `TableQRModal.jsx`**
   - จัดการการเพิ่ม/ลดจำนวนสินค้า ลบรายการในตะกร้า ใส่หมายเหตุถึงครัว และส่งออร์เดอร์ใหม่เข้าฐานข้อมูลกลางด้วย `POST /orders` (`createOrder`)

---

## 3. รายละเอียดงานและจุดที่ต้องอธิบายได้ของ 【คนที่ 2: ฝั่งพนักงานครัว & Admin】

### ไฟล์ที่รับผิดชอบโดยตรง
1. **`src/pages/StaffOrdersPage.jsx`**
   - ดึงออร์เดอร์จากทุกโต๊ะด้วย `getAllOrders()` พร้อมทำ Auto-Polling ใน `useEffect` ทุก 2.5 วินาที เพื่อให้ใบออร์เดอร์ใหม่เด้งเข้าจอห้องครัวอัตโนมัติ
   - มีระบบ **ค้นหาตามเลขโต๊ะ (เช่น `A05`) หรือชื่ออาหาร** และ **กรองตามสถานะออร์เดอร์ (`pending`, `preparing`, `served`)**
   - แสดงแถบแจ้งเตือนด่วนเมื่อมีโต๊ะกด **เรียกพนักงาน** หรือ **แจ้งขอเช็กบิล** พร้อมปุ่มกดรับทราบและเคลียร์โต๊ะว่าง (`PATCH /tables/:id`)
2. **`src/pages/AdminMenuPage.jsx`**
   - ระบบ **CRUD จัดการเมนูอาหารครบวงจร**:
     - **Create (`POST /menus`)**: เพิ่มเมนูสุกี้ใหม่ผ่าน `MenuFormModal`
     - **Read (`GET /menus`)**: แสดงตารางรายการอาหารพร้อมค้นหาและกรองหมวดหมู่
     - **Update (`PUT /menus/:id` & `PATCH /menus/:id`)**: แก้ไขรายละเอียด/ราคา หรือกดปุ่มสลับสถานะ **พร้อมขาย / สินค้าหมดชั่วคราว**
     - **Delete (`DELETE /menus/:id`)**: ลบเมนูออกจากระบบ
3. **`src/pages/AdminDashboardPage.jsx`**
   - ใช้ `useMemo` คำนวณสถิติภาพรวมร้าน ได้แก่ ยอดขายรวมทั้งหมด (`totalRevenue`), จำนวนบิลทั้งหมด, จำนวนโต๊ะที่ใช้งานอยู่ และคำนวณ **5 อันดับเมนูสุกี้ขายดี** จากประวัติการสั่งจริง
4. **`src/components/MenuFormModal.jsx`, `OrderTicketCard.jsx`, `OrderStatusBadge.jsx`, `StatsSummaryCard.jsx`**
   - ใน `MenuFormModal.jsx` มีฟังก์ชัน `validate()` ตรวจสอบความถูกต้องของฟอร์ม (ห้ามเว้นว่าง และราคาต้องมากกว่า 0) เพื่อเก็บคะแนนส่วนการจัดการข้อผิดพลาด (Error Handling)

---

## 4. โพยคำถาม-คำตอบสำหรับสอบรายบุคคล (Individual Q&A Cheat Sheet)

* **คำถาม 1: "ทำไมหน้าจอลูกค้าสั่งอาหารแล้ว หน้าจอพนักงานถึงเห็นข้อมูลเดียวกันได้?"**
  - **คำตอบ:** เพราะเราไม่ได้เก็บออร์เดอร์ไว้แค่ใน React State ของเครื่องลูกค้า แต่ส่งผ่าน `fetch` (`POST http://localhost:3001/orders`) ไปบันทึกใน `db.json` บน `json-server` และหน้าจอพนักงานใช้ `useEffect` ตั้ง `setInterval` ดึงข้อมูลชุดเดียวกันขึ้นมาแสดงผลครับ
* **คำถาม 2: "ใช้ React Hooks อะไรบ้าง และใช้ทำไม?"**
  - `useState`: เก็บข้อมูลเมนู, ออร์เดอร์, คำค้นหา, หมวดหมู่ที่เลือก และสถานะเปิด/ปิด Modal
  - `useEffect`: ใช้เรียก API ตอนโหลดหน้าครั้งแรก, ตั้งเวลาดึงสถานะออร์เดอร์อัตโนมัติ (Polling), และซิงค์ตะกร้าสินค้าลง `localStorage`
  - `useMemo`: ใช้กรองรายการอาหาร/ออร์เดอร์ตามคำค้นหา และคำนวณยอดรวมราคาเพื่อไม่ให้คำนวณซ้ำโดยไม่จำเป็นทุกครั้งที่ Render
  - `useContext`: ใช้ใน `OrderContext.jsx` เพื่อให้ `Navbar`, `MenuCard`, `CartModal` และหน้าต่างๆ เข้าถึงข้อมูลโต๊ะและตะกร้าสินค้าได้โดยไม่ต้องส่ง Props ซ้อนกันหลายชั้น (Prop Drilling)
* **คำถาม 3: "มีการดักจับข้อผิดพลาด (Error Handling) อย่างไรบ้าง?"**
  - ใน `sukiApi.js` ตรวจสอบ `if (!response.ok)` ทุกฟังก์ชัน หากลืมเปิด `json-server` หน้าเว็บจะจับด้วย `try...catch` แล้วแสดงกล่องแจ้งเตือนสีแดงพร้อมปุ่มกดลองใหม่ และใน `MenuFormModal.jsx` มีการตรวจสอบค่าว่างและราคาติดลบก่อนบันทึกเสมอ

---

## 5. ลำดับการสาธิตตอนนำเสนอออนไลน์ (Demo Flow 5 นาที)

1. **เปิดเบราว์เซอร์ 2 หน้าต่างวางคู่กัน (ซ้าย-ขวา):**
   - **หน้าต่างซ้าย (คนที่ 1 นำเสนอ):** เปิดหน้าลูกค้า `http://localhost:5173` เลือก **โต๊ะ A05** เปิดโชว์ QR Code ประจำโต๊ะ → เข้าหน้าเมนู ค้นหาคำว่า *"วากิว"* กดหัวใจเมนูโปรด เลือกอาหารใส่ตะกร้า 2–3 ถาด ใส่หมายเหตุ แล้วกด **ยืนยันการสั่งอาหาร**
   - **หน้าต่างขวา (คนที่ 2 นำเสนอ):** เปิดหน้าห้องครัว `http://localhost:5173/staff/orders` รอไว้ ออร์เดอร์ของ **โต๊ะ A05** จะเด้งขึ้นมาทันที → กดปุ่มเปลี่ยนสถานะเป็น **กำลังเตรียมอาหาร** และ **เสิร์ฟอาหารแล้ว**
2. **ดูการซิงค์สถานะแบบ Real-time:**
   - **คนที่ 1** ชี้ที่หน้าต่างซ้าย (`/my-orders`) ให้ดูว่าแถบสถานะของลูกค้าเปลี่ยนเป็น **3. เสิร์ฟแล้ว** ตามทันที จากนั้นกดปุ่ม **แจ้งขอเช็กบิล**
3. **จัดการหลังบ้านและ CRUD เมนู:**
   - **คนที่ 2** กดรับแจ้งเตือนเช็กบิลและเคลียร์โต๊ะ A05 บนหน้าห้องครัว → สลับไปหน้า **จัดการเมนู (`/admin/menus`)** สาธิตการเพิ่มเมนูใหม่ / กดสลับสถานะ "สินค้าหมด" (ให้ดูว่าหน้าลูกค้าขึ้นสินค้าหมดทันที) → ปิดท้ายด้วยหน้า **สถิติร้าน (`/admin/dashboard`)**
