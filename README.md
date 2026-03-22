# UnixX Proxy

High-performance Roblox API proxy with intelligent caching, rate limiting, and AI-powered chat integration. Built with Node.js, Express, and a modern React frontend.

## Features

- **Unified API Gateway** -- Single endpoint for Roblox user data, avatars, social info, games, inventory, and catalog
- **Smart Caching** -- In-memory caching with NodeCache to reduce redundant API calls and improve response times
- **Rate Limiting** -- Configurable request throttling to prevent abuse and stay within Roblox API limits
- **AI Chat** -- Integrated Groq-powered AI chat with message history support
- **Full Scan** -- Deep data aggregation for universes and places in a single request
- **Interactive Docs** -- Built-in API documentation with live endpoint testing
- **SPA Frontend** -- Modern React UI with particle effects, smooth transitions, and responsive design

## Tech Stack

| Layer     | Technology             |
|-----------|------------------------|
| Runtime   | Node.js                |
| Framework | Express 5              |
| Cache     | NodeCache              |
| HTTP      | Axios                  |
| Frontend  | React + Vite           |
| AI        | Groq API               |
| Deploy    | Vercel                 |

## Project Structure

```
roblox-proxy/
  index.js                  # Entry point
  vercel.json               # Vercel deployment config
  src/
    routes/
      user.js               # /roblox/user/:id, /roblox/username/:username
      avatar.js             # /roblox/avatar/:id, /roblox/avatar-headshot/:id
      social.js             # /roblox/friends, /roblox/groups, /roblox/badges
      inventory.js          # /roblox/inventory/:id/:type
      game.js               # /roblox/game/:placeId, servers, gamepasses
      catalog.js            # /roblox/catalog/search, /roblox/catalog/item/:id
      scan.js               # /roblox/scan/universe, /roblox/scan/place
      ai.js                 # /api/chat/ai
      status.js             # /status, /api/endpoints
    services/
      roblox.js             # Axios wrapper for Roblox API calls
      cache.js              # NodeCache configuration
    middleware/
      rateLimiter.js        # Express rate limiter
    utils/
      logger.js             # Morgan-based request logger
  client/
    src/
      pages/
        Landing.jsx         # Landing page with code previews
        Docs.jsx            # Interactive API documentation
      components/
        Navbar.jsx           # Navigation bar
        Particles.jsx        # Canvas particle system
        Icons.jsx            # Centralized SVG icon components
      hooks/
        useAnimations.js     # Scroll reveal and counter hooks
        useMousePosition.js  # Mouse position tracking
      styles/
        global.css           # Design tokens and base styles
```

## API Endpoints

### User
```
GET /roblox/user/:id                    # User profile
GET /roblox/user/:id/complete           # Full profile with presence, followers, badges, groups
GET /roblox/username/:username          # Lookup by username
```

### Avatar
```
GET /roblox/avatar/:id                  # Full body thumbnail
GET /roblox/avatar-headshot/:id         # Headshot thumbnail
```

### Social
```
GET /roblox/friends/:id                 # Friends list
GET /roblox/groups/:id                  # Groups and roles
GET /roblox/badges/:id                  # User badges
GET /roblox/user/:id/badges/awarded-dates?badgeIds=1,2,3
```

### Inventory
```
GET /roblox/inventory/:id/:type         # By asset type ID (8=Hat, 11=Shirt, etc.)
```

### Game
```
GET /roblox/game/:placeId               # Game info with votes and favorites
GET /roblox/game/:placeId/servers       # Server list
GET /roblox/universe/:id/gamepasses     # Game passes
GET /roblox/universe/:id/dev-products   # Developer products
GET /roblox/universe/:id/badges         # Universe badges
GET /roblox/user/:userId/gamepass/:gamePassId/ownership
GET /roblox/user/:userId/universe/:universeId/gamepasses-owned
```

### Catalog
```
GET /roblox/catalog/search?keyword=...  # Search catalog
GET /roblox/catalog/item/:itemId        # Item details by asset ID
```

### Scan
```
GET /roblox/scan/universe/:universeId   # Full universe data aggregation
GET /roblox/scan/place/:placeId         # Full place data with servers
```

### AI Chat
```
POST /api/chat/ai                       # Chat with message history
GET  /api/chat/ai/:msg                  # Quick message
```

### Status
```
GET /status                             # Health check with cache stats
GET /cache/clear                        # Clear all cache
GET /api/endpoints                      # List all endpoints with metadata
```

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/bimzp2/roblox-proxy.git
cd roblox-proxy
npm run install:all
```

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key
```

### Development

```bash
npm run dev
```

The backend runs on `http://localhost:3000`. The frontend dev server runs separately:

```bash
cd client
npm run dev
```

### Production Build

```bash
npm run build:client
npm start
```

### Deploy to Vercel

```bash
vercel deploy --prod
```

Or connect the GitHub repository at [vercel.com/new](https://vercel.com/new) for automatic deployments on push.

## Preview

https://roblox-proxy-nsvrgkzhy-bimawawoys-projects.vercel.app/

## License

ISC
