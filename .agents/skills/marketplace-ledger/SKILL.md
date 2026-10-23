---
name: marketplace-ledger
description: >-
  Marketplace Collection-Agent Accounting, Two-Way Escrow Netting (Prepaid on Trip vs. Pay at Counter/Tour),
  Cancellation Clawback, FX Rate Lock at Capture, Monthly Commission Spread Tax Invoicing,
  and SHAN PRIVÉ Subscription Tax Invoicing (distilled from `BlnkFinance/blnk`, `mercurjs/mercur`,
  `msg2ai/hotel-team-skills`, and `openaccountant/skills`).
  Use this skill whenever working on bookings, checkout, payments, refunds, receipts, tax invoices,
  payouts, or double-entry journals in `trip.express/x`, `trip.express/web`, and `trip.express/mobile`.
---

# Marketplace Collection-Agent Ledger & Tax Invoicing Skill (`trip.express`)

Distilled from **`BlnkFinance/blnk`** (ACID Double-Entry Financial Ledger), **`mercurjs/mercur`** (Multi-Vendor Marketplace Split & Settlement), **`msg2ai/hotel-team-skills/hotel-finance-controller`** (OTA Remittance & Variance Audit), and **`openaccountant/skills`**.

---

## 1. Strategic Tax & Legal Principle (IFRS 15 — Agent vs. Principal)

`trip.express` NEVER issues commercial Tax Invoices (`Invoice`) for the Gross Transaction Value (GTV) of third-party Experiences. The fulfilling Partner/Venue is legally responsible for issuing the goods/service Tax Invoice to the customer.

`trip.express` issues official Tax Invoices (`finances.Invoice` / `INV-YMMDD-######`) in **ONLY TWO SCENARIOS**:
1. **`scope = "commission"` — Monthly Partner Commission / Margin Spread Tax Invoice**:
   - Issued at month-end (`cycle: YYYY-MM`) for the net platform commission spread (`Spread = GTV - Net Supplier Cost`).
2. **`scope = "prive"` — SHAN PRIVÉ Membership / Subscription Tax Invoice**:
   - Issued for 100% of the annual membership fee (`Tier.annual_fee`), which is direct principal revenue of **SHAN Holdings Pte. Ltd.** (`viettel`, `misa`, `vnpt` for VN; `stripe` for international).

---

## 2. Dual Settlement Channels (`settlement: "trip"` vs. `"venue"`)

1. **`settlement = "trip"` (Prepaid on Trip Express — Collection Agent / Thu hộ)**:
   - Customer pays online (`Payment.status in ("PAID", "SETTLED")`).
   - `JournalService.sync_collection(booking)` issues a **Collection Receipt (`finances.Receipt` / `RCP-YMMDD-######`)** with `collection_agent = True`.
   - Customer tax details (`company`, `tax_id`, `email`, `address`) are stored in `booking.metadata.collection` and forwarded to the Partner so the Partner can issue the VAT invoice directly to the customer.
2. **`settlement = "venue"` (Pay Later at Counter / On Tour)**:
   - Customer books on `trip.express` and pays directly at the Partner counter/tour desk.
   - `trip.express` issues only a **Booking Voucher (`BKG-...`)** (`status = "pay_at_venue"`), never a Receipt or Invoice.

---

## 3. FX Rate Lock at Capture & Cancellation Clawback Invariants

1. **Deterministic FX Rate Lock (`fx_rate` at Capture)**:
   - When a guest pays in a display currency (`EUR`, `JPY`, `KRW`, `VND`) while settlement ledger is in base currency (`USD`/`VND`), lock the exact `fx_rate` on `Payment` and `Booking._metadata["fx_rate"]` at capture time.
   - All subsequent refunds, partial adjustments, and month-end partner settlements MUST use the historical `fx_rate` locked at capture so exchange-rate drift never causes ledger imbalance.
2. **Tiered Cancellation Policy & Commission Clawback**:
   - Refunds follow the offering cancellation policy (`>48h` 100% refund, `24h–48h` 50% refund, `<24h` or `no_show` 0% refund).
   - When a prepaid booking is refunded or partially refunded, `JournalService` atomically posts a reversing journal entry and **claws back (`clawback`)** the proportional affiliate/partner commission (`apps/marketing/models/commission.py`) before month-end payout.
3. **Voucher QR Redemption (`Escrow -> Payable`)**:
   - Scanning a `trip.express` voucher QR at a partner counter (or `getding.io` terminal) marks the booking `redeemed` and transitions the partner net payout from `escrow_held` to `payable`.

---

## 4. Two-Way Escrow Netting at Month-End (`JournalService.issue_commission`)

At month-end, `JournalService.issue_commission(user, cycle, billing)` reconciles both channels:
- `trip_spread`: Commission on bookings prepaid on `trip.express` (`trip_gtv` held in Escrow).
- `venue_spread`: Commission on confirmed/completed bookings paid at the Partner counter/tour (`venue_gtv` held by Partner).
- `total_spread = trip_spread + venue_spread`.
- **Escrow Offset (`amount_paid`)**: `min(total_spread, trip_gtv)`.
- **Balance Due (`balance_due`)**: `max(0, total_spread - amount_paid)`.
- **Net Payout to Partner (`net_payout`)**: `max(0, trip_gtv - total_spread)`.

---

## 5. Concise Ubiquitous Naming Standard

- Always use 1–2 word identifiers: `Billing`, `Invoice`, `InvoiceItem`, `Seller`, `sync_collection`, `issue_commission`, `issue_prive`, `billing`, `invoice`, `invoices`, `settlement`, `scope`, `cycle`, `reference`, `viettel`, `misa`, `vnpt`, `stripe`.
