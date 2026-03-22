# 🎮 Roblox Proxy API

API proxy sederhana untuk mengakses Roblox API dengan fitur caching dan rate limiting.

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dan tambahkan GROQ_API_KEY untuk fitur AI

# Run server
npm start
```

Server berjalan di `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── app.js           # Express app setup
├── server.js        # Entry point
├── config/          # Configuration
├── middleware/      # Logger, error handler, rate limiter
├── services/        # Cache & Roblox API client
├── routes/          # Endpoint per fitur
└── utils/           # Helper functions
```

---

## 🔗 API Endpoints

### 👤 User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roblox/user/:id` | Get user by ID |
| GET | `/roblox/user/:id/complete` | Get complete user data |
| GET | `/roblox/username/:username` | Get user by username |

**Example:**
```bash
curl http://localhost:3000/roblox/user/1
curl http://localhost:3000/roblox/username/Roblox
```

---

### 🖼️ Avatar

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roblox/avatar/:id` | Get full avatar |
| GET | `/roblox/avatar-headshot/:id` | Get headshot |

**Query Params:**
- `size` - Image size (default: 720x720 / 420x420)
- `circular` - Circular avatar (true/false)

**Example:**
```bash
curl "http://localhost:3000/roblox/avatar/1?size=420x420&circular=true"
```

---

### 👥 Social

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roblox/friends/:id` | Get user friends |
| GET | `/roblox/groups/:id` | Get user groups |
| GET | `/roblox/badges/:id` | Get user badges |
| GET | `/roblox/user/:userId/badges/awarded-dates` | Get badge awarded dates |

**Example:**
```bash
curl http://localhost:3000/roblox/friends/1
curl "http://localhost:3000/roblox/badges/1?limit=10"
```

---

### 📦 Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roblox/inventory/:id/:type` | Get user inventory by type |

**Asset Types:** `Asset`, `GamePass`, `Badge`, `Bundle`

**Example:**
```bash
curl http://localhost:3000/roblox/inventory/1/Asset
```

---

### 🎮 Game

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roblox/game/:placeId` | Get game info |
| GET | `/roblox/game/:placeId/servers` | Get game servers |
| GET | `/roblox/universe/:universeId/gamepasses` | Get game passes |
| GET | `/roblox/universe/:universeId/dev-products` | Get dev products |
| GET | `/roblox/universe/:universeId/badges` | Get universe badges |
| GET | `/roblox/user/:userId/gamepass/:gamePassId/ownership` | Check gamepass ownership |
| GET | `/roblox/user/:userId/universe/:universeId/gamepasses-owned` | Get owned game passes |

**Example:**
```bash
curl http://localhost:3000/roblox/game/1818
curl http://localhost:3000/roblox/universe/13058/gamepasses
```

---

### 🛒 Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roblox/catalog/search` | Search catalog |
| GET | `/roblox/catalog/item/:itemId` | Get item details |

**Query Params:**
- `keyword` - Search keyword
- `category` - Category filter
- `limit` - Max results (default: 60)

**Example:**
```bash
curl "http://localhost:3000/roblox/catalog/search?keyword=hat"
```

---

### 🔍 Scan

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roblox/scan/universe/:universeId` | Full universe scan |
| GET | `/roblox/scan/place/:placeId` | Full place scan |

Scan endpoints return comprehensive data including game info, votes, favorites, gamepasses, dev products, badges, and active servers.

**Example:**
```bash
curl http://localhost:3000/roblox/scan/place/1818
```

---

### 🤖 AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/ai` | Full AI chat control |
| GET | `/api/chat/ai/:msg` | Quick AI message |

**POST Body:**
```json
{
  "messages": [{"role": "user", "content": "Hello!"}],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**Example:**
```bash
curl http://localhost:3000/api/chat/ai/Hello
```

---

### 📊 Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Health check & cache stats |
| GET | `/cache/clear` | Clear all cache |

**Example:**
```bash
curl http://localhost:3000/status
```

---

## ⚙️ Configuration

Environment variables (`.env`):

```env
PORT=3000
GROQ_API_KEY=your_groq_api_key
```

---

## 🚀 Deploy to Vercel

Project sudah siap deploy ke Vercel:

```bash
vercel
```

---

## 📝 License

ISC
