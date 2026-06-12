import { TripExpress } from './client';
import { ContactInput, InquiryInput } from './types';

export class ContactClient {
  private client: TripExpress;

  constructor(client: TripExpress) {
    this.client = client;
  }

  async submitContact(data: ContactInput, turnstileToken?: string): Promise<{ success: boolean; message?: string }> {
    const body: Record<string, any> = { ...data };
    if (turnstileToken) {
      body['cf-turnstile-response'] = turnstileToken;
    }
    return this.client.request<{ success: boolean; message?: string }>('/contacts/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async submitInquiry(data: InquiryInput, turnstileToken?: string): Promise<{ success: boolean; message?: string }> {
    const body: Record<string, any> = { ...data };
    if (turnstileToken) {
      body['cf-turnstile-response'] = turnstileToken;
    }
    return this.client.request<{ success: boolean; message?: string }>('/inquiries/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}
