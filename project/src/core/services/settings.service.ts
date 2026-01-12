import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Settings Data Models
 *
 * Purpose: Type definitions for application settings and configuration
 */

export interface AutoReplyRule {
  id: string;
  trigger: 'positive' | 'negative' | 'neutral';
  message: string;
}

export interface AppSettings {
  sentimentAnalysis: boolean;
  darkMode: boolean;
  autoReplyRules: AutoReplyRule[];
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data?: AppSettings;
}

/**
 * Settings Service
 *
 * Purpose: Manages all application settings and configuration operations
 * Handles fetching and persisting user preferences
 *
 * Why Injectable: Allows dependency injection throughout the app
 * Why providedIn 'root': Singleton service shared across components
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = '/api/settings';

  constructor(private http: HttpClient) {}

  /**
   * Fetch current application settings
   *
   * @returns Observable<AppSettings> - Stream of current settings
   *
   * Why: Load user's saved preferences and configuration
   */
  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(this.apiUrl);
  }

  /**
   * Save application settings
   *
   * @param settings - Updated settings object
   * @returns Observable<SettingsResponse> - Response confirmation
   *
   * Why: Persist user preferences to backend/storage
   */
  saveSettings(settings: AppSettings): Observable<SettingsResponse> {
    return this.http.put<SettingsResponse>(this.apiUrl, settings);
  }
}
