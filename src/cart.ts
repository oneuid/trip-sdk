import { TripExpress } from './client';
import { Cart, CartLineInput } from './types';

export class CartClient {
  private client: TripExpress;

  constructor(client: TripExpress) {
    this.client = client;
  }

  async get(cartId: string): Promise<Cart> {
    return this.client.request<Cart>(`/carts/${cartId}/`);
  }

  async create(lines: CartLineInput[] = []): Promise<Cart> {
    return this.client.request<Cart>('/carts/', {
      method: 'POST',
      body: JSON.stringify({ lines }),
    });
  }

  async addLine(cartId: string, line: CartLineInput): Promise<Cart> {
    return this.client.request<Cart>(`/carts/${cartId}/add_line/`, {
      method: 'POST',
      body: JSON.stringify(line),
    });
  }

  async removeLine(cartId: string, lineId: string): Promise<Cart> {
    return this.client.request<Cart>(`/carts/${cartId}/remove_line/`, {
      method: 'POST',
      body: JSON.stringify({ line_id: lineId }),
    });
  }

  async clear(cartId: string): Promise<void> {
    return this.client.request<void>(`/carts/${cartId}/clear/`, {
      method: 'POST',
    });
  }

  async evaluate(cartId: string): Promise<{ opportunities: any }> {
    return this.client.request<{ opportunities: any }>(`/carts/${cartId}/evaluate/`);
  }
}
