export interface TripExpressConfig {
  baseURL: string;
  apiKey?: string;
  token?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface CartLineInput {
  offering_id: string;
  quantity: number;
  metadata?: Record<string, any>;
}

export interface CartLine {
  id: string;
  offering_id: string;
  quantity: number;
  price: string;
  metadata?: Record<string, any>;
}

export interface Cart {
  id: string;
  user_id?: string;
  lines: CartLine[];
  total_amount: string;
  currency: string;
}

export interface BookingLine {
  id: string;
  name: string;
  quantity: number;
  price: string;
}

export interface Booking {
  id: string;
  reference: string;
  user_id: string;
  amount: string;
  currency: string;
  status: 'draft' | 'paid' | 'confirmed' | 'completed' | 'cancelled';
  lines: BookingLine[];
  created_at: string;
}

export interface PaymentIntentRequest {
  booking_reference: string;
  amount: number;
  currency: string;
  return_url?: string;
}

export interface PaymentLinkResponse {
  status: string;
  payment_link: string;
  reference: string;
}

export interface AirwallexIntentResponse {
  status: string;
  client_secret: string;
  payment_intent_id: string;
}

export interface WalletChargeResponse {
  status: string;
  message: string;
}

export interface TicketPayload {
  booking_ref: string;
  amount: string;
  currency: string;
  buyer_uid: string | null;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

export interface TicketCredential {
  payload: TicketPayload;
  issuer: string;
  signature: string;
}

export interface ContactInput {
  first_name: string;
  last_name: string;
  email: string;
  message: string;
}

export interface InquiryInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
  budget?: string;
  requirements?: string;
  currency?: string;
  metadata?: Record<string, any>;
}
