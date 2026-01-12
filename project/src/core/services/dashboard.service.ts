import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Dashboard Data Models
 *
 * Why interfaces: Provide type safety for API responses
 * Making the frontend self-documenting and preventing runtime errors
 */

export interface DashboardKPIs {
  nss: number;
  sla: number;
  rating: number;
  pending: number;
  volume: number;
}

export interface NSSDataPoint {
  day: string;
  value: number;
}

export interface ChannelShare {
  swiggy: number;
  zomato: number;
  instore: number;
}

export interface TopStore {
  name: string;
  volume: number;
  nss: number;
}

export interface DashboardCharts {
  nssTrend: NSSDataPoint[];
  channelShare: ChannelShare;
  topStores: TopStore[];
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  charts: DashboardCharts;
}

/**
 * Dashboard Service
 *
 * Purpose: Centralized service for fetching dashboard data from the API
 * Separates data fetching logic from components for better testability and reusability
 *
 * Why HttpClient: Standard Angular service for HTTP operations
 * Why Observable: Allows components to subscribe to async data and unsubscribe automatically
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  /**
   * Fetch dashboard statistics
   *
   * @returns Observable<DashboardStats> - Stream of dashboard data
   *
   * Why GET request: Fetching read-only data
   * Why /api/dashboard/stats: Standard RESTful endpoint naming convention
   * The mock interceptor catches this request and returns realistic data
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
