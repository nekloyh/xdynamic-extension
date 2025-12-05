# Kế hoạch Triển khai Design System và Redesign Phase 2

Dựa trên tài liệu "Kế hoạch triển khai Redesign UI/UX cho Dự án Che Hình Ảnh Nhạy Cảm (Phase 2: Extension Screens)", tài liệu này tổng hợp **Design System** đã được thống nhất và **Kế hoạch Triển khai Chi tiết** cho các màn hình Extension.

## 1. Design System (Style Guide)

Design System này được xây dựng trên nền tảng **Minimalist Card-based** và sử dụng **Tailwind CSS** cùng các thư viện component dựa trên **Radix UI** (như Shadcn/ui) để đảm bảo tính nhất quán và khả năng mở rộng.

### 1.1. Color Palette

| Thuộc tính | Tên Tailwind CSS | Mã Hex | Mô tả |
| :--- | :--- | :--- | :--- |
| **Primary** | `blue-700` | `#1D4ED8` | Màu chủ đạo cho các hành động chính (CTA), branding và các yếu tố tương tác. |
| **Secondary** | `cyan-500` | `#06B6D4` | Màu phụ trợ cho các chỉ báo trạng thái quan trọng (ví dụ: "Protection ON"). |
| **Neutral (Nền Sáng)** | `gray-50` | `#F9FAFB` | Màu nền chính của ứng dụng. |
| **Neutral (Nền Card)** | `white` | `#FFFFFF` | Màu nền cho các khối nội dung (Card). |
| **Text Chính** | `gray-900` | `#1F2937` | Màu văn bản chính. |
| **Success** | `green-500` | `#10B981` | Màu cho các thông báo thành công. |
| **Warning/Danger** | `red-600` | `#DC2626` | Màu cho các hành động nguy hiểm hoặc cảnh báo. |

### 1.1.1. Dark Mode Color Pattern (derived from Light palette)

| Thuộc tính | Mã Hex | Mô tả |
| :--- | :--- | :--- |
| **Dark Background** | `#0B1220` | Nền chính cho Dark Mode. |
| **Dark Card / Surface** | `#111827` | Nền card/khối nội dung chính. |
| **Elevated Card** | `#16213D` | Bề mặt nâng (hover/overlay). |
| **Border** | `#1F2A3D` | Viền/đường phân tách. |
| **Muted Foreground** | `#94A3B8` | Văn bản phụ / icon trạng thái. |
| **Primary (Dark)** | `#3B82F6` | CTA/Brand trên nền tối (kế thừa #1D4ED8, tăng độ sáng). |
| **Secondary (Dark)** | `#22D3EE` | Màu phụ/badge trên nền tối (kế thừa #06B6D4). |
| **Focus/Ring** | `#3B82F6` | Outline và ánh cho trạng thái focus. |
| **Glass Overlay** | `rgba(16,23,42,0.35~0.6)` | Overlay/blur cho Dark Mode. |

Nguyên tắc: giữ tỉ lệ Primary/Secondary tiết chế, đảm bảo độ tương phản giữa nền tối và văn bản (foreground ≥ 4.5:1). Card và background không đổi layout khi chuyển theme.

### 1.2. Typography

*   **Font Family:** Inter, ui-sans-serif, system-ui, ... (Đã có trong `tailwind.config.mjs`).
*   **Nguyên tắc:** Sử dụng kích thước và độ đậm (weight) nhất quán để thiết lập hệ thống phân cấp rõ ràng.

### 1.3. Layout & Components

*   **Ngôn ngữ Thiết kế:** Minimalist Card-based.
    *   **Card:** Sử dụng góc bo tròn nhẹ (`rounded-lg`) và đổ bóng tinh tế (`shadow-sm` hoặc `shadow-md`) để phân tách nội dung.
    *   **Layout Màn hình Độc lập:** Centered Card (Card trung tâm, căn giữa màn hình) cho Login, Payment, Report.
*   **Thư viện Component:** Khuyến nghị sử dụng các component từ Shadcn/ui (hoặc tự xây dựng dựa trên Radix UI) để tạo ra các thành phần như Button, Input, Card, Progress Bar, Switch, v.v.

### 1.4. Prompt: Language & Theme UX

- Language: 2-option segmented control (English/Vietnamese), nhãn rõ ràng, helper đặt ngay dưới để nhắc “Đồng bộ Popup + Dashboard + tab liên quan”.
- Theme: 2-option segmented control (Light/Dark) kèm pill trạng thái hiển thị theme đang áp dụng; ghi chú rõ theme chỉ áp dụng cho Dashboard/User Hub.
- Chuyển theme phải mượt: đặt class `light`/`dark` lên `<html>` trước khi hydrate (đọc cache localStorage), bật `color-scheme`, tránh FOUC hoặc thay đổi layout khi chuyển.

## 2. Kế hoạch Triển khai Chi tiết (Phase 2)

Kế hoạch này tập trung vào việc refactor các component hiện có trong thư mục `frontend/extension/src/` để áp dụng Design System mới.

### 2.1. Chuẩn bị Môi trường (Phase 3)

1.  **Kiểm tra/Cài đặt Shadcn/ui:** Xác nhận thư mục component (`src/components/ui/`) và file cấu hình (`components.json`) đã được thiết lập. Nếu chưa, tiến hành cài đặt các component cơ bản (Button, Card, Input, Form, Progress).
2.  **Cấu hình Tailwind:** Đảm bảo các màu sắc Primary/Secondary đã được định nghĩa trong `tailwind.config.mjs` để dễ dàng sử dụng.

### 2.2. Triển khai Redesign (Phase 4, 5, 6)

| Màn hình | File Dự kiến | Thay đổi Chính (Wireframe Text) |
| :--- | :--- | :--- |
| **Login Screen** | `src/pages/LoginApp.tsx` | **Layout tập trung (Centered Card):** Đặt form vào Card trung tâm. Header Card chứa Logo/Tên. Tách biệt đăng nhập Email/Password (nút Primary) và bên thứ ba (nút Outline/Icon). |
| **Verification Screen** | `src/pages/VerificationScreen.tsx` | **Tăng tính trực quan:** Đặt form vào Card trung tâm. Sử dụng 6 ô input riêng biệt cho mã 2FA. Thêm nút "Gửi lại mã" nổi bật. |
| **Onboarding Flow** | `src/pages/OnboardingApp.tsx` | **Stepped Form (Progress Bar):** Sử dụng `Progress` component ở đầu Card để chỉ báo tiến trình (ví dụ: Step 1/4). Mỗi bước là một Card độc lập. |
| **Payment Screen** | `src/pages/PaymentScreen.tsx` | **Card-based Pricing:** Thiết kế các gói dịch vụ (Free, Plus, Pro) thành các Card nổi bật. Sử dụng Primary Color để làm nổi bật gói được chọn. Tóm tắt đơn hàng (Card) cố định. |
| **Confirmation Screen** | `src/pages/PaymentConfirmationScreen.tsx` | **Trạng thái trực quan:** Icon lớn (dấu tick) màu Success/Primary. Hiển thị Mã Giao dịch (Report ID) nổi bật trong Card. Nút Primary "Quay lại Dashboard". |
| **Report Form** | `src/pages/ReportApp.tsx` | **Form đơn giản:** Đặt form vào Card trung tâm. Tăng cường mô tả (tooltip) cho các trường phức tạp. Nút Primary "Gửi Báo cáo". |
| **Report Success** | `src/pages/ReportSuccessScreen.tsx` | **Thông báo rõ ràng:** Icon Success lớn. Hiển thị Mã Báo cáo (Report ID) nổi bật trong Card. Thông tin về quy trình xử lý. |

### 2.3. Thay đổi API (Lưu ý cho Backend)

Mặc dù Phase 2 không yêu cầu API mới, cần đảm bảo các API hiện tại đáp ứng:

1.  **POST /api/v1/report:** Trả về `report_id` ngay lập tức.
2.  **GET /api/v1/subscription/plans:** Cung cấp đủ thông tin chi tiết về lợi ích của từng gói dịch vụ.
3.  **API Đăng nhập/Đăng ký:** Trả về `hasCompletedOnboarding` để điều hướng người dùng.

Tài liệu này sẽ được sử dụng làm hướng dẫn chi tiết cho các bước triển khai code tiếp theo.
