# @trip-express/sdk

Universal TypeScript/JavaScript SDK & **Ding AI Direct-Booking Widget** for the Trip.Express travel platform.

Designed to power direct-booking transactions for hotels, resorts, and transport operators, while connecting to `trip/x` backend APIs and the `UID.one` identity ecosystem.

---

## 🔔 Ding Embedded Agent Widget (`ding.js`)

**`Ding`** is the standalone 14KB embedded AI Direct-Booking Agent widget. Hotel, resort, and transport operators embed `ding.js` on their website with a 1-line script tag to turn static web visitors into direct bookings with **0 OTA commission trap**.

### 1-Line Script Tag Integration
```html
<!-- Embed Ding Widget on Partner Domain -->
<script src="https://trip.express/sdk/ding.js" data-tenant="YOUR_ORGANIZATION_ID"></script>
```

### How Ding Works:
1. **Tenant-Scoped AI Conversation**: Strictly scoped to the embedding tenant's product catalog (`organization_id`).
2. **Interactive Rich Cards**: Displays room options, route waypoints, date pickers, and price breakdowns directly inside the widget.
3. **In-Widget Direct Checkout**: Customers pay via Bank QR (VietQR), Passkey, or Card directly inside the widget without leaving the partner domain.
4. **Partner Direct Invoicing**: The partner issues the 100% Gross VAT Invoice directly to the customer, while `Trip.Express` collects a minimal platform fee.

---

## 📦 Installation (@trip-express/sdk NPM Package)

Install via your favorite package manager:

```bash
# Using pnpm
pnpm add @trip-express/sdk

# Using npm
npm install @trip-express/sdk
```

---

## Quick Start

Initialize the `TripExpress` client:

```typescript
import { TripExpress } from '@trip-express/sdk';

const sdk = new TripExpress({
  baseURL: 'https://api.trip.express',
  token: 'user-jwt-access-token',
});
```

---

## License

MIT License © Trip.Express
