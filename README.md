# 📊 Báo Cáo & Quản Trị Quảng Cáo Meta (Facebook Ads) - baocaoads

Ứng dụng Web Dashboard tinh gọn, hiện đại kết nối trực tiếp với Meta Marketing API (v21.0) để theo dõi báo cáo, kiểm soát chiến dịch, bật/tắt quảng cáo 1 click và xem trực tiếp link bài viết đang chạy trên Facebook/Instagram.

---

## 🌟 Tính Năng Nổi Bật

1. **🔗 Mở trực tiếp Link bài viết Facebook đang chạy:**
   - Bóc tách mã `effective_object_story_id` từ Ad Creative để sinh link chính xác đến bài viết thực tế trên Facebook (kể cả Dark Post / Bài quảng cáo ẩn).
   - Nút mở bài viết Facebook và bài viết Instagram kèm ảnh thumbnail và trích dẫn caption bài viết.

2. **⚡ Bật / Tắt Chiến Dịch tức thì (1 Click):**
   - Nút gạt Switch Toggle trực quan, cập nhật trạng thái `ACTIVE` ⟷ `PAUSED` thời gian thực lên Meta API.
   - Tự động ưu tiên xếp các **Chiến dịch đang Bật / Đang hoạt động lên đầu trang**.

3. **📊 Báo cáo Thống kê Toàn diện:**
   - Bộ lọc khoảng thời gian: Hôm nay, Hôm qua, 7 ngày qua, 14 ngày qua, 30 ngày qua, Tháng này, Toàn bộ thời gian.
   - Thống kê chi tiết: **Chi tiêu (Spend)**, **Kết quả (Cuộc trò chuyện / Mua hàng / Lead)**, **Chi phí mỗi kết quả (CPR)**, **Lượt tiếp cận & hiển thị (Reach, Impressions, CPM)**, **Lượt Click, CTR% và CPC**.

4. **🔐 Bảo mật & Phân quyền thông minh:**
   - Màn hình khóa xác thực kín đáo, hỗ trợ **tự động ghi nhớ thiết bị (Cookie + LocalStorage)** để không bị thoát phiên.
   - Phân quyền theo mật khẩu:
     - `admin`: Quản trị viên, xem toàn bộ tất cả chiến dịch và tổng ngân sách.
     - `thuong123`: Tự động lọc các chiến dịch của **Thương**, gom báo cáo chi tiêu riêng.
     - `quynh123`: Tự động lọc đúng các chiến dịch **Quỳnh ila**, gom báo cáo chi tiêu riêng.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework:** Next.js (App Router, Turbopack)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **API:** Meta Graph API (Marketing API v21.0)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Clone repository & Cài đặt dependencies
```bash
git clone https://github.com/25phongsusu/baocaoads.git
cd baocaoads
npm install
```

### 2. Cấu hình biến môi trường (.env.local)
Tạo file `.env.local` tại thư mục gốc dự án theo mẫu `.env.example`:
```env
# 1. Access Token dài hạn (ads_read, ads_management)
META_ACCESS_TOKEN=your_meta_access_token_here

# 2. App Secret
META_APP_SECRET=your_app_secret_here

# 3. ID Tài khoản quảng cáo (bắt đầu bằng act_)
META_AD_ACCOUNT_ID=act_xxxxxxxxxxxx

# 4. Phiên bản API
META_GRAPH_API_VERSION=v21.0
```

### 3. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`

### 4. Build môi trường sản xuất (Production)
```bash
npm run build
npm start
```
