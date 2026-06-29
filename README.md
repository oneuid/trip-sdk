# @trip-express/sdk

Universal TypeScript/JavaScript SDK for the Trip.Express travel and embedded commerce platform. Designed to interact with the Trip.Express APIs for cart management, bookings, payments, and seamless integration with the sovereign UID.one identity vault.

## Features

- **Cart Management**: Handle user shopping sessions, add/remove offerings, and evaluate dynamic bundling opportunities.
- **Booking Lifecycle**: Draft, retrieve, update, cancel bookings, and download secure PDF tickets.
- **Embedded Payments**: Generate payment intents/links for OnePay, Airwallex, and direct wallet charges (Starbucks-style prepaid float).
- **UID.one Integration**: Securely save cryptographically signed travel credentials directly into a user's decentralized UID.one Vault.
- **Dual-Bundle Support**: Complete ESM and CommonJS builds out of the box with auto-generated TypeScript declarations.

---

## Installation

Install via your favorite package manager:

```bash
# Using pnpm
pnpm add @trip-express/sdk

# Using npm
npm install @trip-express/sdk

# Using yarn
yarn add @trip-express/sdk
```

---

## Quick Start

Initialize the `TripExpress` client using either a partner API key or a user access token:

```typescript
import { TripExpress } from '@trip-express/sdk';

// Initialize with a Bearer Token (User Context)
const sdk = new TripExpress({
  baseURL: 'https://api.trip.express',
  token: 'user-jwt-access-token',
});

// Or initialize with a partner API Key
const partnerSdk = new TripExpress({
  baseURL: 'https://api.trip.express',
  apiKey: 'your-partner-api-key',
});
```

---

## API Reference

### 1. Cart Management (`sdk.cart`)

Transient carts allow customers to accumulate stay, flight, or activity offerings before booking.

#### Retrieve a Cart
```typescript
const cart = await sdk.cart.get('cart-uuid');
```

#### Create a Cart with Offerings
```typescript
const newCart = await sdk.cart.create([
  { offering_id: 'offering-123', quantity: 2 }
]);
```

#### Add or Remove Lines
```typescript
const updatedCart = await sdk.cart.addLine('cart-uuid', {
  offering_id: 'offering-456',
  quantity: 1,
  metadata: { bed_type: 'king' }
});

await sdk.cart.removeLine('cart-uuid', 'line-item-id');
```

#### Clear Cart
```typescript
await sdk.cart.clear('cart-uuid');
```

#### Evaluate Cart Opportunities
Generate dynamic bundling discounts, cross-sell recommendation engines, or loyalty promotions:
```typescript
const opportunities = await sdk.cart.evaluate('cart-uuid');
console.log('Available promotions:', opportunities);
```

---

### 2. Bookings (`sdk.booking`)

Manage finalized reservations, tickets, and travel schedules.

#### Create a Booking
```typescript
const booking = await sdk.booking.create({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  amount: '500.00',
  currency: 'USD',
  lines: [
    { title: 'Luxury Stay', price: '500.00', quantity: 1 }
  ]
});
```

#### List Bookings (with search & filtering)
```typescript
const bookings = await sdk.booking.list({
  status: 'confirmed',
  search: 'TRIP-REF-123'
});
```

#### Cancel Booking
```typescript
await sdk.booking.cancel('TRIP-REF-123');
```

#### Download Booking PDF Ticket
```typescript
const pdfBuffer = await sdk.booking.getPDF('booking-id');
// Output can be saved to disk or streamed to user
```

---

### 3. Payments (`sdk.payment`)

Seamless payment integration for credit cards, local gateways, and private balances.

#### OnePay Payment Link
```typescript
const linkResponse = await sdk.payment.createOnePayLink({
  booking_reference: 'TRIP-REF-123',
  amount: 500.00,
  currency: 'USD',
  return_url: 'https://my-app.com/payment-result'
});
console.log('Pay here:', linkResponse.payment_link);
```

#### Airwallex Payment Intent
```typescript
const airwallex = await sdk.payment.createAirwallexIntent({
  booking_reference: 'TRIP-REF-123',
  amount: 500.00,
  currency: 'USD'
});
// Use client_secret to mount Airwallex Card Elements on your frontend
```

#### Wallet Charge (Starbucks prepaid float model)
Perform immediate, zero-fee clearing using the user's pre-funded account balance:
```typescript
const chargeResult = await sdk.payment.chargeWallet('TRIP-REF-123', 500.00, 'USD');
if (chargeResult.status === 'success') {
  console.log('Booking paid instantly via prepaid balance!');
}
```

---

### 4. UID.one Sovereign Vault Integration

Trip.Express works in tandem with the **UID.one** identity ecosystem. Travel passes and ticket credentials signed cryptographically by the Trip.Express issuer can be added directly to the user's decentralised Vault.

```typescript
import { OneUID } from '@oneuid-auth-js/core';
import { saveTicketToUIDVault } from '@trip-express/sdk';

// 1. Initialize UID client
const uid = new OneUID({ ... });

// 2. Assume you have received a signed ticket credential from Trip.Express API
const ticketCredential = {
  payload: {
    booking_ref: 'TRIP-REF-123',
    amount: '500.00',
    currency: 'USD',
    buyer_uid: 'uid:john-doe',
    items: [{ name: 'Luxury Suite Stay', quantity: 1, price: '500.00' }]
  },
  issuer: 'trip.express',
  signature: 'ed25519-signature-string...'
};

// 3. Save the verifiable credential directly to the user's sovereign Vault
await saveTicketToUIDVault(uid, ticketCredential);
```

---

### 5. Embedded Search Widget (White-label Commerce Integration)

You can embed a beautiful, lightweight, and fully interactive travel search widget directly on any partner website (e.g. WordPress, Webflow, static HTML) using a simple `<script>` tag. The widget automatically detects the host domain to apply your organization's theme, routes, and custom branding.

#### 1. Add the Target HTML Container
Place this element where you want the search widget to render:

```html
<div id="trip-express-widget"></div>
```

#### 2. Configure and Include the Script
Initialize your partner credentials and configurations via `window.TripExpressWidgetConfigs` and load the compiled script:

```html
<script>
  window.TripExpressWidgetConfigs = {
    // Optional: Manually override Organization ID
    // If omitted, the widget resolves this automatically based on window.location.host
    organizationId: "123", 
    themeColor: "#FFB800",       // Primary branding/button hex color
    baseURL: "https://trip.express", // Production or staging backend API URL
    searchButtonText: "Tìm Vé Xe" // Text displayed on the primary action button
  };
</script>
<script src="https://cdn.trip.express/sdk/dist/widget.js" async></script>
```

---

## Development

Build package distribution assets:
```bash
# Install dependencies (requires pnpm approval for built engines)
pnpm install
pnpm approve-builds --all

# Run TS build and bundle
pnpm run build
```

---

## License

MIT License. Copyright &copy; 2026 Trip.Express.
