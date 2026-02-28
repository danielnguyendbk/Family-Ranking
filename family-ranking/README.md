# 🏆 Family Ranking System

Hệ thống quản lý bảng xếp hạng gia đình — Spring Boot 3 + JWT + MySQL/H2.

---

## 📁 Cấu trúc project

```
family-ranking/
├── pom.xml
└── src/main/
    ├── java/com/familyranking/
    │   ├── FamilyRankingApplication.java
    │   ├── config/
    │   │   ├── AsyncConfig.java
    │   │   ├── DataSeeder.java          ← Seed game mẫu khi khởi động
    │   │   └── SecurityConfig.java
    │   ├── controller/
    │   │   ├── AuthController.java
    │   │   ├── GameController.java
    │   │   ├── MatchController.java
    │   │   ├── TeamController.java
    │   │   └── UserController.java
    │   ├── dto/
    │   │   ├── request/
    │   │   │   ├── AuthRequest.java     ← Register, Login, ForgotPassword, ResetPassword
    │   │   │   ├── GameRequest.java
    │   │   │   ├── MatchRequest.java
    │   │   │   ├── ProfileUpdateRequest.java
    │   │   │   └── TeamRequest.java
    │   │   └── response/
    │   │       └── Response.java        ← Tất cả response DTO
    │   ├── entity/
    │   │   ├── Game.java
    │   │   ├── Match.java               ← enum BetType, MatchStatus
    │   │   ├── PlayerGameStats.java     ← Điểm theo từng game
    │   │   ├── Team.java
    │   │   └── User.java                ← implements UserDetails
    │   ├── exception/
    │   │   ├── BadRequestException.java
    │   │   ├── ForbiddenException.java
    │   │   ├── GlobalExceptionHandler.java
    │   │   └── ResourceNotFoundException.java
    │   ├── repository/
    │   │   ├── GameRepository.java
    │   │   ├── MatchRepository.java
    │   │   ├── PlayerGameStatsRepository.java
    │   │   ├── TeamRepository.java
    │   │   └── UserRepository.java
    │   ├── security/
    │   │   ├── JwtAuthFilter.java
    │   │   └── JwtService.java
    │   └── service/
    │       ├── AuthService.java
    │       ├── GameService.java
    │       ├── MailService.java
    │       ├── MatchService.java
    │       ├── TeamService.java
    │       ├── UserService.java
    │       └── impl/
    │           ├── AuthServiceImpl.java
    │           ├── GameServiceImpl.java
    │           ├── MatchServiceImpl.java
    │           ├── TeamServiceImpl.java
    │           └── UserServiceImpl.java
    └── resources/
        └── application.yml
```

---

## ⚙️ Cài đặt & Chạy

### Yêu cầu
- Java 17+
- Maven 3.8+
- (Optional) MySQL 8+ cho môi trường prod

### Dev mode (H2 in-memory — không cần cài gì thêm)

```bash
./mvnw spring-boot:run
# hoặc
mvn spring-boot:run
```

API chạy tại: `http://localhost:8080`  
H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:familyrankingdb`)

---

### Prod mode (MySQL)

1. Tạo database MySQL:
```sql
CREATE DATABASE family_ranking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Set biến môi trường:
```bash
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export MAIL_USERNAME=your@gmail.com
export MAIL_PASSWORD=your-app-password
```

3. Chạy với profile prod:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 📧 Cấu hình Gmail

1. Bật **2-Step Verification** trên tài khoản Google
2. Vào `myaccount.google.com` → Security → **App passwords**
3. Tạo App Password cho "Mail"
4. Điền vào `application.yml` (dev) hoặc biến môi trường (prod):

```yaml
spring:
  mail:
    username: your-email@gmail.com
    password: abcd efgh ijkl mnop   # 16-char app password
```

---

## 🔑 API Reference

### AUTH

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/auth/register` | `{username, email, password}` | ❌ |
| POST | `/auth/login` | `{username, password}` | ❌ |
| POST | `/auth/forgot-password` | `{email}` | ❌ |
| POST | `/auth/reset-password` | `{token, newPassword}` | ❌ |

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "tuan",
  "email": "tuan@gmail.com"
}
```

Sau khi login, thêm header vào mọi request:
```
Authorization: Bearer <token>
```

---

### USER

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Lấy thông tin bản thân |
| PUT | `/users/profile` | Cập nhật avatar, username |

---

### GAME

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/games` | Danh sách game |
| POST | `/games` | Tạo game mới |

**POST /games body:**
```json
{
  "name": "Cờ Tướng",
  "description": "...",
  "winPoint": 3,
  "drawPoint": 1,
  "lossPoint": 0,
  "teamGame": false
}
```

---

### MATCH

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/matches/create` | Tạo trận đấu |
| POST | `/matches/{id}/accept` | Chấp nhận trận |
| POST | `/matches/{id}/reject` | Từ chối trận |
| POST | `/matches/{id}/settle-request` | Yêu cầu trả kèo |
| POST | `/matches/{id}/settle-confirm` | Xác nhận đã trả kèo |
| GET | `/matches/my` | Lịch sử trận của mình |
| GET | `/matches/ranking?gameId=1` | Bảng xếp hạng |

**POST /matches/create (1v1):**
```json
{
  "gameId": 1,
  "teamMatch": false,
  "opponentId": 2,
  "betType": "LY_NUOC",
  "betDescription": "Ai thua mua trà sữa",
  "score1": 3,
  "score2": 1
}
```

**POST /matches/create (team):**
```json
{
  "gameId": 3,
  "teamMatch": true,
  "team1Id": 1,
  "team2Id": 2,
  "betType": "FRIENDLY",
  "winnerId": 1
}
```

---

### TEAM

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/teams` | Tạo đội |
| GET | `/teams?gameId=1` | Danh sách đội theo game |

**POST /teams body:**
```json
{
  "name": "Đội Anh Trai",
  "gameId": 3,
  "memberIds": [1, 2, 3]
}
```

---

## 🎯 Business Logic

### Luồng tạo trận
```
Người A tạo trận (PENDING)
        ↓
Người B nhận thông báo
        ↓
   ACCEPT / REJECT
        ↓ (ACCEPT)
Điểm được cộng tự động
        ↓
Status = COMPLETED
```

### Tính điểm
- **Thắng**: +3 điểm (cấu hình được theo Game)
- **Hòa**: +1 điểm
- **Thua**: +0 điểm

Điểm được lưu cả ở `PlayerGameStats` (theo từng game) và `User.totalPoints` (tổng).

### Luồng trả kèo
```
Người thắng → "Yêu cầu đã trả kèo" (betSettledRequested = true)
        ↓
Người thua xác nhận (betSettledConfirmed = true)
```

---

## 🧪 Test nhanh với curl

```bash
# 1. Đăng ký
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"p1@gmail.com","password":"123456"}'

# 2. Đăng nhập
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"123456"}' | jq -r .token)

# 3. Xem profile
curl http://localhost:8080/users/me -H "Authorization: Bearer $TOKEN"

# 4. Xem danh sách game
curl http://localhost:8080/games -H "Authorization: Bearer $TOKEN"

# 5. Xem bảng xếp hạng game 1
curl "http://localhost:8080/matches/ranking?gameId=1" -H "Authorization: Bearer $TOKEN"
```

---

## 🛠️ Môi trường phát triển

| Thứ | Tool |
|-----|------|
| IDE | IntelliJ IDEA |
| API test | Postman hoặc HTTPie |
| DB viewer | DBeaver |
| Java | Amazon Corretto 17 |

---

*Built with ❤️ — Family Ranking System v1.0*
