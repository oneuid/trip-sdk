import { TripExpressConfig } from './types';
import { CartClient } from './cart';
import { BookingClient } from './booking';
import { PaymentClient } from './payment';
import { ContactClient } from './contact';
import { ExperienceClient } from './experience';

export class TripExpress {
  public config: TripExpressConfig;
  public cart: CartClient;
  public booking: BookingClient;
  public payment: PaymentClient;
  public contact: ContactClient;
  public experience: ExperienceClient;

  constructor(config: TripExpressConfig) {
    this.config = {
      ...config,
      baseURL: config.baseURL.replace(/\/$/, ''),
    };
    this.cart = new CartClient(this);
    this.booking = new BookingClient(this);
    this.payment = new PaymentClient(this);
    this.contact = new ContactClient(this);
    this.experience = new ExperienceClient(this);
  }

  public async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseURL}${path}`;
    const headers = new Headers(options.headers || {});

    if (this.config.token) {
      headers.set('Authorization', `Bearer ${this.config.token}`);
    } else if (this.config.apiKey) {
      headers.set('X-API-Key', this.config.apiKey);
    } else if (this.config.clientId && this.config.clientSecret) {
      headers.set('X-Client-ID', this.config.clientId);
      headers.set('X-Client-Secret', this.config.clientSecret);
    }

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`TripExpress API error [${response.status}]: ${response.statusText}. Details: ${errorText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }
}
