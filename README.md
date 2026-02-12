# 🌿 EcoRoute — App Brief

> **AI-powered food delivery that batches orders to cut emissions, cost, and traffic.**  

---

## 📌 What is EcoRoute?

EcoRoute is a food delivery platform where **every user is given a choice**: Eco-Batch or Rush Delivery. When users choose Eco-Batch, orders from nearby drop-off points are **grouped into a single delivery run**. This reduces:

- 🚗 **Delivery vehicle trips** (fewer rides = less fuel)
- 🌍 **Carbon emissions** (CO₂ saved scales with batch size)
- 💸 **Delivery cost** (₹20 batched vs ₹40 rush)

The app tracks individual and community impact via a **Carbon Dashboard** and **Campus Leaderboard**.

---

## ✅ What WORKS (Fully Functional)

| Feature | Description |
|---|---|
| **Onboarding** | 3 animated swipeable screens explaining the app's mission. Sets `localStorage` flag so it only shows once. |
| **Authentication** | Full register + login flow with JWT tokens. Tokens stored in `localStorage`, auto-attached via Axios interceptor. Demo credentials: `rahul@iitd.ac.in` / `demo123`. |
| **Restaurant Discovery** | 8 seeded restaurants with real images. Search bar (name + cuisine), cuisine filter tabs. Eco-score badges per restaurant. |
| **Impact Preview on Cards** | Each restaurant card shows `Save ~95g CO₂` alongside a live **"X orders nearby now!"** count pulled from the `GET /restaurants/batch-counts` endpoint — making batching feel alive and social. |
| **Restaurant Detail + Menu** | Hero image, rating, delivery time, eco-score. Full menu with category tabs. Add to cart with quantity controls. |
| **Cart & Checkout** | Cart items with quantity +/−, remove. Delivery address input. Bill summary (subtotal + delivery fee). Static "Eco-Batch & Save!" promo card. **Every user gets Eco-Batch vs Rush choice** (bottom sheet modal). |
| **Order Placement** | Creates real order in PostgreSQL. Eco-Batch → `waiting_for_batch` (5-min window). Rush → `pending` (instant dispatch). |
| **Batch Waiting Screen** | Circular countdown timer (5 min). Live batch member count. Growing CO₂ savings estimate. "Rush Now" and "Extend +3 min" buttons. **"Invite Friends to Batch"** social share card (WhatsApp + Copy Invite). |
| **Synced Timers** | All users in the same batch share the exact same `batch_window_ends` timestamp — User B joining an existing batch inherits User A's timer, not a new 5-min window. |
| **Synced Map Tracking** | Rider position is interpolated toward the **centroid** of all delivery points in the batch. Every user in a batch sees the exact same rider position, progress, and status. |
| **Order Tracking (Map)** | Leaflet map with custom markers (restaurant, delivery, rider, batched drops). Dashed polyline route. Rider position interpolated from `dispatched_at`. Progress steps: Placed → Preparing → Out for Delivery → Delivered. |
| **Active Order Re-access** | Green banner on Home page for any non-delivered order (including `waiting_for_batch`). Tap to return to tracking/batch screen. |
| **Carbon Dashboard** | Total CO₂ saved, trees equivalent, km not driven. Weekly bar chart (Recharts). Campus leaderboard (10 seeded users). |
| **Profile** | Fresh stats (fetched from `/auth/me` on mount). Expandable order history with status badges (including "Batching" for `waiting_for_batch`). Saved addresses. Eco journey card linking to Dashboard. Logout. |
| **Bottom Navigation** | 5 tabs: Home, Search, Cart, Impact, Profile. Floating pill style with glassmorphism. Animated active state with `layoutId` spring transition. Cart badge with count. |

---

## 🤝 Social Batching — "Invite Friends"

The batch waiting screen includes an **"Invite Friends to Batch!"** card:

| Element | Details |
|---|---|
| **WhatsApp** | Opens WhatsApp with pre-filled message: *"🌿 I just ordered from Green Bowl Kitchen on EcoRoute! Join my eco-batch to save CO₂ and split delivery costs!"* |
| **Copy Invite** | Uses Web Share API on mobile, falls back to clipboard on desktop |
| **Social Proof** | Footer shows *"12 people shared batches this hour on campus"* with avatar stack |
| **Why it matters** | Viral loop: more shares → more batch joins → higher CO₂ savings → better eco-grades |

---

## ⚠️ What is SIMULATED (Works, but with generated/mock data)

| Feature | How it's Simulated | What Real Implementation Would Need |
|---|---|---|
| **Rider Position** | Linear interpolation toward delivery centroid (for batched) or individual delivery point (for rush). Progress = elapsed minutes since `dispatched_at` ÷ total time (30 min rush / 40 min batched). | Real GPS from rider's phone via WebSocket. |
| **Order Status Progression** | Auto-calculated from elapsed time: 0–30% = Preparing, 30–90% = Out for Delivery, 90%+ = Delivered. | Kitchen confirms "ready", rider confirms "picked up" / "delivered". |
| **CO₂ Savings Formula** | `base_emission × (1 − 1/batch_size)` where `base_emission ≈ 285g` (avg 5km delivery). More orders in batch → higher per-order savings. Credited on **dispatch**, not order creation. | Real route optimization data, vehicle type, actual distance calculation via mapping API. |
| **Batch Discovery** | Backend finds existing `waiting_for_batch` orders for the same `restaurant_id`. In demo, each restaurant is its own batch pool. | Geospatial query: find orders within X km radius regardless of restaurant. Use clustering algorithms for optimal batching. |
| **Delivery Route on Map** | Straight polyline from restaurant → batched drops → user's drop. | Real routing via OSRM / Google Directions API with turn-by-turn waypoints. |
| **Weekly Savings Chart** | Seeded data for demo users. New users start with empty chart until they place batched orders. | Aggregate from real order history grouped by ISO week. |
| **Leaderboard** | 10 pre-seeded users with varying CO₂ stats. | Live query sorted by `total_co2_saved`, paginated. |
| **Restaurant Images** | Public food images from Unsplash URLs. | Restaurant partners upload their own imagery. |
| **"Nearby Now" Count** | Driven by real `waiting_for_batch` orders in DB (shows 0 when nobody is batching). | Would also factor in location proximity, not just restaurant match. |
| **Social Proof ("12 people")** | Hardcoded number in the invite card footer. | Live aggregate of shares/invites in last hour from analytics. |

---

## ❌ What Does NOT Work

### User-Facing Gaps

| Feature | Status | Notes |
|---|---|---|
| **Search Tab** | Routes to Home (same page) | No dedicated search UI with autocomplete, recent searches, or trending. |
| **Payment Integration** | Not implemented | Orders place instantly with no payment gateway (Razorpay / Stripe needed). |
| **Real-time Push Updates** | Polling every 3s | No WebSocket or SSE. True real-time would use Socket.IO or Firebase. |
| **Delivery Address Picker** | Plain text input | No map-based pin-drop or geocoding (Google Places API needed). |
| **Notifications** | Menu item exists, no functionality | Needs FCM (Firebase Cloud Messaging) or APNs for push notifications. |
| **Settings / Privacy / Help** | Menu items only | No pages or logic behind them. |
| **Saved Addresses** | Hardcoded | Not persisted to DB. Would need CRUD endpoints. |
| **Payment Methods** | Hardcoded count | No actual card/UPI storage or tokenization. |
| **Order Cancellation** | Not implemented | No cancel flow or refund logic. |
| **Ratings & Reviews** | Not implemented | No post-delivery rating screen or restaurant review system. |

### Restaurant / Partner Front (Not Built)

| Feature | Notes |
|---|---|
| **Restaurant Dashboard** | No partner portal for managing menu, prices, availability, or order acceptance. |
| **Order Acceptance Flow** | Orders go directly to `preparing` — no "Accept / Reject" step from the restaurant. |
| **Kitchen Display System** | No real-time order queue for kitchen staff. |
| **Menu Management** | Menu items are seeded; no CRUD UI for restaurants to add/edit/remove items. |
| **Revenue Analytics** | No partner analytics (sales, peak hours, popular items). |

### Delivery Agent Front (Not Built)

| Feature | Notes |
|---|---|
| **Rider App** | No separate app for delivery agents. |
| **Ride Assignment** | No dispatch algorithm assigning riders to batches. |
| **Navigation** | No turn-by-turn navigation for riders. |
| **Earnings Dashboard** | No rider earnings, tips, or incentive tracking. |
| **Availability Toggle** | No online/offline status for riders. |
| **Proof of Delivery** | No OTP or photo-based delivery confirmation. |

### Admin / Operations (Not Built)

| Feature | Notes |
|---|---|
| **Admin Panel** | No admin dashboard for platform operations. |
| **User Management** | No ability to ban users, resolve disputes, or issue refunds. |
| **Analytics Dashboard** | No platform-wide metrics (GMV, orders/day, avg batch size, CO₂ trends). |
| **Geofencing** | No delivery zone management. |

---

## 💡 Eco-Grade: Locality-Based Batching Probability

### Dynamic Eco-Grades

The Eco-Grade should represent the **probability of successful batching** for a restaurant, relative to the **user's locality**.

#### How It Would Work

```
Eco-Grade = f(order_density_near_user, restaurant_popularity_in_area, time_of_day)
```

| Factor | Weight | Description |
|---|---|---|
| **Order Density** | High | Number of recent/active orders within 2km of the user's delivery address. More nearby orders = higher batching chance. |
| **Restaurant Popularity** | Medium | How frequently this restaurant is ordered from in this locality. Popular restaurants attract concurrent orders. |
| **Time of Day** | Medium | Lunch (12–2pm) and dinner (7–10pm) peaks have more orders = better batching. Off-peak = lower grades. |
| **Historical Batch Rate** | Low | What % of past orders from this restaurant in this locality were successfully batched. |

#### Grade Meanings

| Grade | Batching Probability | What the User Sees |
|---|---|---|
| **A+** | > 80% | "Very likely to batch — high demand area" |
| **A** | 50–80% | "Good chance of batching" |
| **B+** | 30–50% | "Moderate batching chance" |
| **B** | < 30% | "Low batching chance — consider rush" |

#### Key Insight

> **The same restaurant can have different Eco-Grades for different users.**
>
> A restaurant near a college hostel may show `A+` for students in that hostel (high order density nearby), but `B` for a user 5km away in a residential area (low nearby order volume).

#### Why This Matters

- **Nudges users toward batchable orders** — "Green Bowl Kitchen is A+ in your area!" encourages batching.
- **Manages expectations** — A `B` grade tells the user batching is unlikely, so Rush might be the better choice.
- **Creates a feedback loop** — More batched orders → better grades → more users choose batching → even better grades.
---

## 🎯 User Flow
```
1. Open app → Onboarding (3 screens) → "Get Started"
2. Login: rahul@iitd.ac.in / demo123
3. Browse restaurants → Notice "Save ~95g CO₂" on cards
4. Tap "Green Bowl Kitchen" (A+ rated)
5. Add 2-3 items → Go to Cart
6. See "Eco-Batch & Save!" promo → Tap "Place Order"
7. Modal: Choose "Eco-Batch" ✅ → Order placed
8. → Batch Waiting Screen:
   - Timer counting down from 5:00
   - "1 order batched, waiting for more..."
   - CO₂ savings growing
   - "Invite Friends to Batch!" — tap WhatsApp to share
9. (Optional: open incognito, login as priya@iitd.ac.in / demo123)
   - Order from same restaurant → Choose Eco-Batch
   - Both users see "2 orders batched! 142g CO₂ saved!"
   - BOTH timers are synced to the same countdown
10. Timer expires → Batch dispatches → Map tracking begins
    - Rider position is IDENTICAL for both users (centroid-based)
    - Route shows both drop-off points
    - Go back to Home → restaurant card now shows "1 nearby!" badge
11. Navigate to Impact tab → See Rahul's dashboard
    - 127kg CO₂ saved, 12 trees equivalent
    - Campus leaderboard
12. Profile → Fresh stats, order history with "Batching" status badge
```

---

## 🚀 Serverless Architecture

EcoRoute uses a modern serverless architecture optimized for scalability and cost-efficiency:

### Backend Stack
- **Runtime**: Node.js with Express
- **Deployment**: Vercel Serverless Functions
- **Database**: Neon PostgreSQL (serverless, auto-scaling)
- **Connection Pooling**: Built-in pg connection pool with SSL

### Key Benefits
1. **Auto-scaling**: Serverless functions scale automatically with traffic
2. **Cost-efficient**: Pay only for actual usage, no idle server costs
3. **Global CDN**: Static assets served via Vercel's edge network
4. **Zero DevOps**: No server management, automatic HTTPS, instant deployments

### Database Schema
PostgreSQL tables (raw SQL, no ORM):
- `users` - User accounts with CO₂ stats
- `restaurants` - Restaurant listings and details
- `menu_items` - Restaurant menus
- `orders` - Order history and tracking
- `batches` - Batched delivery groups

### API Location
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.vercel.app/api`

All API routes are serverless functions in `frontend/api/` that connect to the Neon PostgreSQL database.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router, Tailwind CSS, Framer Motion, Recharts, React Leaflet |
| **Backend** | Node.js (Express), Serverless Functions (Vercel), JWT auth, Bcrypt |
| **Database** | PostgreSQL (Neon - serverless) |
| **Maps** | Leaflet + CartoDB tile layer |
| **Fonts** | Syne (headings), Manrope (body) |
| **Design** | Mobile-first, glassmorphism, dark green + lime palette |
| **Deployment** | Vercel (Frontend + Serverless API) |


## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Neon PostgreSQL account (or any PostgreSQL provider)

### Environment Variables
Create a `.env` file in the `frontend/` directory:

```bash
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_secret_key_here

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://your-domain.vercel.app
```

### Local Development

```bash
# 1. Install frontend dependencies
cd frontend
npm install

# 2. Install API dependencies
cd api
npm install

# 3. Initialize database and seed data
node run-seed.js

# 4. Start development server (from frontend/)
cd ..
npm start
```

The app will run on `http://localhost:3000` with API proxied via Vercel dev server.

### Database Seeding
The seed script (`frontend/api/run-seed.js`) creates:
- 8 demo restaurants with menus
- 10 demo users with CO₂ stats
- Sample batched orders for testing

Run it anytime to reset the database:
```bash
cd frontend/api
node run-seed.js
```

