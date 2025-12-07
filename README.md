<!-- markdownlint-disable -->
# XDynamic Extension

Hệ thống phát hiện và che nội dung nhạy cảm (NSFW) đa thành phần:
- **Browser Extension** (Chrome/Firefox - Manifest V3) viết bằng React + TypeScript.
- **Backend API** (FastAPI) với xác thực, thanh toán và suy luận mô hình ML.
- **Admin Dashboard** (React + TypeScript) phục vụ quản trị và phân tích.
Tài liệu kiến trúc chi tiết: `docs/ARCHITECTURE.md`.

## Yêu cầu
- **Python**: 3.9+ (khuyến nghị 3.11)
- **Node.js**: 18+ cùng npm/pnpm/yarn
- **Git**: để clone mã nguồn
- **Browser**: Chrome hoặc Firefox Developer Edition/Nightly

## Khởi chạy nhanh (local)
1) Clone repository
```bash
git clone <repository-url>
cd xdynamic-extension
```
2) Backend (FastAPI)
- `cd backend`
- Tạo venv: `python -m venv .venv` và kích hoạt (`.venv/Scripts/Activate.ps1` hoặc `source .venv/bin/activate`)
- Cài đặt: `pip install -r requirements.txt`
- Sao chép `.env.example` -> `.env`, cập nhật JWT/OAuth/payment, `APP_URL` (callback host) và `DATABASE_URL` nếu cần
- Chạy dev: `python run.py --reload`
  - API docs: http://localhost:8000/docs
  - Health: http://localhost:8000/health
3) Extension (Chrome/Firefox)
- `cd frontend/extension`
- `npm install`
- Sao chép `.env.example` -> `.env`; điền `VITE_API_BASE_URL` (backend) và `VITE_GOOGLE_CLIENT_ID` (nếu dùng)
- Dev: `npm run dev`; Build: `npm run build` (ra `dist/`)
- Load unpacked extension từ `dist/` trong Chrome/Firefox
4) Admin Dashboard (tùy chọn)
- `cd frontend/admin-dashboard`
- `npm install`
- Sao chép `.env.example` -> `.env`; điền `VITE_API_BASE_URL`
- Dev: `npm run dev` (mặc định http://localhost:5173); Build: `npm run build`
5) Callback pages (dev)
- Có sẵn tại `frontend/callback-pages/` (không cần build)
- Khi `DEBUG=true`, backend phục vụ tại `http://localhost:8000/fe`
- Nếu dùng host riêng, cập nhật `APP_URL` trong `backend/.env`

## Biến môi trường & kết nối
- `VITE_API_BASE_URL` (FE) -> backend base URL (ví dụ: http://localhost:8000)
- `APP_URL` (BE) -> base URL nhận redirect OAuth/Payment (mặc định trả về `/fe`)
- CORS backend cho: `*`, `chrome-extension://*`, `http://localhost:5173`, `http://localhost:3000` (dev)
- OAuth: `/api/auth/google/callback` -> `APP_URL/auth/callback`; frontend gọi `/api/auth/google`
- Payment: `/api/payment/success` -> `APP_URL/payment/success`

## Docker (Production Backend)
```bash
cd backend

# Build image
docker build -f Dockerfile.prod -t xdynamic-api:latest .

# Run
docker-compose -f docker-compose.prod.yaml up -d
```
Backend sẽ chạy tại: **http://localhost:8000** hoặc **https://app.xdynamic.cloud** (production)

## Cấu trúc thư mục
```
backend/                FastAPI backend (routers, services, repositories, models, schemas, middleware)
frontend/
  extension/            Browser extension (React + Vite)
  admin-dashboard/      Admin dashboard (React)
  callback-pages/       Static OAuth/payment redirect pages phục vụ tại /fe khi DEBUG=true
docs/                   Kiến trúc và tài liệu bổ sung
README.md
```

## Kiểm thử nhanh
- Backend: `curl http://localhost:8000/health`
- API docs: mở http://localhost:8000/docs
- Extension: build `dist`, load extension, đăng nhập (hoặc dùng chế độ free), mở trang bất kỳ, chọn "Scan This Page", kiểm tra console (F12 > Console)

## Troubleshooting
- Backend không khởi động: kiểm tra Python >= 3.9, đã kích hoạt venv, đã tạo `.env`, port 8000 không bị chiếm
- Extension không load: đã `npm run build`, thư mục `dist` tồn tại, reload extension, kiểm tra lỗi console trong popup
- Lỗi CORS: đảm bảo backend chạy, `VITE_API_BASE_URL` đúng, cấu hình CORS backend đã cho domain frontend

## License
Bổ sung license của dự án tại đây.

## Contributors
Thêm thông tin contributors tại đây.
