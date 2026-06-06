import { TripExpress } from './client';
import { Booking } from './types';

export class BookingClient {
  private client: TripExpress;

  constructor(client: TripExpress) {
    this.client = client;
  }

  async list(params?: Record<string, string>): Promise<{ results: Booking[]; count: number }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.client.request<{ results: Booking[]; count: number }>(`/bookings/${query}`);
  }

  async get(idOrRef: string): Promise<Booking> {
    const isNumeric = /^\d+$/.test(idOrRef);
    if (isNumeric) {
      return this.client.request<Booking>(`/bookings/${idOrRef}/`);
    } else {
      const response = await this.list({ search: idOrRef });
      const booking = response.results.find(b => b.reference.toLowerCase() === idOrRef.toLowerCase());
      if (!booking) {
        throw new Error(`Booking with reference "${idOrRef}" not found.`);
      }
      return booking;
    }
  }

  async create(data: Partial<Booking>): Promise<Booking> {
    return this.client.request<Booking>('/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(idOrRef: string, data: Partial<Booking>): Promise<Booking> {
    const booking = await this.get(idOrRef);
    return this.client.request<Booking>(`/bookings/${booking.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async cancel(reference: string): Promise<{ detail: string }> {
    return this.client.request<{ detail: string }>(`/bookings/${reference}/cancel/`, {
      method: 'POST',
    });
  }

  async getPDF(id: string): Promise<ArrayBuffer> {
    const response = await fetch(`${this.client.config.baseURL}/bookings/${id}/pdf/`, {
      headers: this.client.config.token ? {
        'Authorization': `Bearer ${this.client.config.token}`
      } : this.client.config.apiKey ? {
        'X-API-Key': this.client.config.apiKey
      } : {}
    });
    if (!response.ok) {
      throw new Error(`Failed to download booking PDF: ${response.statusText}`);
    }
    return response.arrayBuffer();
  }
}
