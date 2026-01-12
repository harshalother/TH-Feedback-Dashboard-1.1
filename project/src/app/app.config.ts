import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { mockApiInterceptor } from '../core/interceptors/mock-api.interceptor';

/**
 * Application Configuration
 *
 * Purpose: Central configuration for all application-wide providers and settings
 *
 * Why provideZoneChangeDetection: Enables Angular's change detection with optimized event coalescing
 * Why provideRouter: Sets up routing system with our route definitions
 * Why provideHttpClient: Enables HTTP requests throughout the app
 * Why withInterceptors: Registers our mock API interceptor to simulate backend
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router configuration with our defined routes
    provideRouter(routes),

    // HTTP client with mock API interceptor
    // The interceptor will catch and mock API calls for development
    provideHttpClient(
      withInterceptors([mockApiInterceptor])
    )
  ]
};
