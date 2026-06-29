import { TripExpress } from './client';
import { Experience, Availability } from './types';

export class ExperienceClient {
  private client: TripExpress;

  constructor(client: TripExpress) {
    this.client = client;
  }

  async list(params?: Record<string, string>): Promise<{ results: Experience[]; count: number }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.client.request<{ results: Experience[]; count: number }>(`/experiences/${query}`);
  }

  async get(idOrSlug: string | number): Promise<Experience> {
    return this.client.request<Experience>(`/experiences/${idOrSlug}/`);
  }

  async getAvailabilities(params?: Record<string, string>): Promise<{ results: Availability[]; count: number }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.client.request<{ results: Availability[]; count: number }>(`/availabilities/${query}`);
  }
}
