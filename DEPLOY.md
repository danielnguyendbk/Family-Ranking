# Hướng dẫn deploy lên Render

## Tổng quan kiến trúc

```
Frontend (Vite/React)  ──►  Render Static Site
Backend (Spring Boot)  ──►  Render Web Service
Database (PostgreSQL)  ──►  Render PostgreSQL
```

---

## 1. Tạo PostgreSQL database trên Render

1. Vào [render.com](https://render.com) → **New → PostgreSQL**
2. Đặt tên, chọn region gần nhất, chọn plan Free
3. Sau khi tạo xong, vào tab **Connect** → sao chép giá trị **Internal Database URL** (dạng `postgresql://user:pass@host/db`)

---

## 2. Deploy Backend (Spring Boot)

### Chuẩn bị

Đảm bảo project build được:
```bash
cd family-ranking
mvn clean package -DskipTests
```
File JAR sẽ nằm ở `target/family-ranking-0.0.1-SNAPSHOT.jar`.

### Tạo Web Service trên Render

1. **New → Web Service** → kết nối GitHub repo
2. Cấu hình:
   - **Root Directory**: `family-ranking`
   - **Runtime**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/family-ranking-0.0.1-SNAPSHOT.jar`

3. Thêm **Environment Variables**:

| Key | Value |
|-----|-------|
| `DB_URL` | Internal Database URL từ bước 1 (thay `postgresql://` → `jdbc:postgresql://`) |
| `DB_USERNAME` | Username của PostgreSQL database |
| `DB_PASSWORD` | Password của PostgreSQL database |
| `JWT_SECRET` | Chuỗi bí mật ngẫu nhiên (≥ 32 ký tự hex) |
| `FRONTEND_URL` | URL của frontend sau khi deploy (vd: `https://family-ranking.onrender.com`) |
| `PORT` | `8080` (Render tự set, không cần thiết) |

> **Lưu ý về DB_URL**: Render trả về URL dạng `postgresql://user:pass@host/db`.  
> Cần đổi thành `jdbc:postgresql://user:pass@host/db` (thêm `jdbc:` ở đầu).

4. Click **Create Web Service** → đợi build xong

Backend URL sẽ có dạng: `https://family-ranking-api.onrender.com`

---

## 3. Deploy Frontend (React/Vite)

### Cấu hình biến môi trường

Tạo file `frontend/.env.production`:
```
VITE_API_URL=https://family-ranking-api.onrender.com
```
*(Thay bằng URL backend thực tế)*

### Build thủ công để kiểm tra
```bash
cd frontend
npm install
npm run build
```
Thư mục `dist/` là kết quả build tĩnh.

### Tạo Static Site trên Render

1. **New → Static Site** → kết nối GitHub repo
2. Cấu hình:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. Thêm **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | URL backend (vd: `https://family-ranking-api.onrender.com`) |

4. Thêm **Redirect/Rewrite Rule** (để React Router hoạt động):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

5. Click **Create Static Site**

---

## 4. Sau khi deploy

1. Vào backend URL: `https://your-api.onrender.com/api/games` → nên trả về `[]`
2. Vào frontend URL → đăng ký tài khoản → đăng nhập → dùng bình thường
3. Dữ liệu được lưu vĩnh viễn trong PostgreSQL

---

## Biến môi trường tóm tắt

### Backend
```
DB_URL=jdbc:postgresql://...
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=<64-char-hex-string>
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## Chạy local với PostgreSQL (tùy chọn)

```bash
# Khởi động PostgreSQL cục bộ, sau đó:
export DB_URL=jdbc:postgresql://localhost:5432/familyranking
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

cd family-ranking
mvn spring-boot:run
```

```bash
# Frontend dev (proxy tự động gọi localhost:8080)
cd frontend
npm run dev
```
