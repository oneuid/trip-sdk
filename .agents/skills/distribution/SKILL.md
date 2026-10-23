---
name: distribution
description: >-
  Universal Marketplace Inventory Locks, ARI Delta Sync, Multi-Experience Group Checkout,
  Channel Sync Webhooks (`apps/webhooks/views/marketplace.py`), and Non-Compete Affiliate Cross-Sell
  (distilled from `daviesevan-svg/channex-claude-skill`, `anthropics/commerce-agents`, and `mercurjs/mercur`).
  Use this skill whenever working on experience offerings, availability slots,
  cart/group checkout, channel webhooks, affiliate attribution, or DING OS cross-sell in `trip.express`.
---

# Universal Marketplace Distribution & ARI Sync Skill (`trip.express`)

Distilled from **`daviesevan-svg/channex-claude-skill`** (Channel Manager ARI Delta Sync & Revision Feed Ingestion), **`anthropics/commerce-agents`** (`examples/travel/`), and **`mercurjs/mercur`**.

---

## 1. Multi-Experience Group Checkout (`GRP-YMMDD-######`)

- When a customer checks out multiple experiences in a single cart (`POST /v1/bookings/checkout/`), `CheckoutView` splits items by `experience_id` into independent `Booking` records (`BKG-YMMDD-######`) linked by a shared `group` reference (`GRP-YMMDD-######`).
- Each `Booking` records its `settlement` channel (`"trip"` for prepaid online vs. `"venue"` for pay at counter / on tour).

---

## 2. Inventory Slot Locks, ARI Delta Sync & Overbooking Guard (`channex-claude-skill`)

1. **Atomic Slot Locks (`offerings.Lock`)**:
   - Reservations hold temporary inventory locks (`Lock`) keyed by session/booking ID inside `transaction.atomic()`.
   - Upon `confirm_payment()`, locks are atomically released (`is_released = True`), `Line` statuses transition to `CONFIRMED`, and external supplier fulfillment tasks (`book_external_supplier_lines_task`) are dispatched.
2. **Outbound ARI Delta Push & Stop-Sell**:
   - Push only changed dates and changed restriction fields (`availability`, `rate`, `stop_sell`, `min_stay`) with range compression and past-date filtering.
   - When a venue marks a `Unit` or slot full on `getding.io`, `stop_sell` propagates immediately to prevent OTA double-bookings.
3. **Inbound Channel Feed Hygiene & Ack-After-Apply**:
   - Inbound webhooks (`POST /v1/webhooks/marketplace/<provider>/` across `viator`, `agoda`, `booking_com`, `airbnb`, `expedia`, `trip_com`, `traveloka`, `klook`, `getyourguide`, `tripadvisor`, `ding`) enforce idempotent deduplication by `reference`.
   - Never silently drop a paid inbound OTA booking during an inventory collision; ingest the booking, flag `overbooked = True` for immediate front-desk reassignment, and acknowledge only after DB commit.

---

## 3. Cross-Merchant Affiliate Attribution & Non-Compete Guardrail

- Affiliate referrals (`?affiliate=<merchant>`) are sanitized via `sanitize_attribution` and persisted in `booking.metadata.attribution`.
- Upon payment confirmation, `record_commission(booking)` records partner commission in `apps/marketing/models/commission.py`.
- When surfacing `trip.express` experiences inside DING OS AI Concierge chats:
  - Enforce the **100% Non-Compete Guardrail** (never recommend experiences that overlap with the host venue's own `sector` or `categories`).
  - Mark AI chat sessions containing `trip.express` cross-sell cards with `metadata.sponsored = True` (`$0` AI quota cost to the merchant).
