import { TripExpress } from './client';
import { PaymentIntentRequest, PaymentLinkResponse, AirwallexIntentResponse, WalletChargeResponse } from './types';

export class PaymentClient {
  private client: TripExpress;

  constructor(client: TripExpress) {
    this.client = client;
  }

  async createOnePayLink(data: PaymentIntentRequest): Promise<PaymentLinkResponse> {
    return this.client.request<PaymentLinkResponse>('/payments/create-onepay-link/', {
      method: 'POST',
      body: JSON.stringify({
        reference: data.booking_reference,
        amount: data.amount,
        currency: data.currency,
        return_url: data.return_url
      }),
    });
  }

  async createAirwallexIntent(data: PaymentIntentRequest): Promise<AirwallexIntentResponse> {
    return this.client.request<AirwallexIntentResponse>('/payments/create-airwallex-intent/', {
      method: 'POST',
      body: JSON.stringify({
        reference: data.booking_reference,
        amount: data.amount,
        currency: data.currency,
        return_url: data.return_url
      }),
    });
  }

  async chargeWallet(bookingReference: string, amount: number, currency: string): Promise<WalletChargeResponse> {
    return this.client.request<WalletChargeResponse>('/payments/wallet-charge/', {
      method: 'POST',
      body: JSON.stringify({
        reference: bookingReference,
        amount,
        currency
      }),
    });
  }
}
