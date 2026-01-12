import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Authentication Response Interface
 * Defines the structure of the API response from login endpoint
 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Authentication Service
 *
 * Purpose: Manages all authentication-related operations including login, logout, and token storage.
 *
 * Why Injectable: Allows this service to be injected into components that need authentication functionality.
 * Why providedIn 'root': Creates a singleton instance shared across the entire application.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal to track authentication state reactively
  // Using signals for better performance and automatic UI updates
  private isAuthenticatedSignal = signal<boolean>(false);

  // Expose readonly version to prevent external modifications
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in on service initialization
    // This handles page refreshes and browser restarts
    this.checkAuthStatus();
  }

  /**
   * Login Method
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Observable<AuthResponse> - API response with token and user data
   *
   * Why tap operator: Allows side effects (storing token) without modifying the stream
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          // Store the JWT token in localStorage for persistence across sessions
          // Why localStorage: Survives browser refreshes and tab closes
          if (response.success && response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.isAuthenticatedSignal.set(true);
          }
        })
      );
  }

  /**
   * Logout Method
   *
   * Purpose: Clears all authentication data and redirects to login
   * Why: Ensures clean logout state and prevents unauthorized access
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Check Authentication Status
   *
   * Purpose: Determines if user has a valid session
   * Called on app initialization and after login
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    // Set authenticated state based on token presence
    // In production, you'd also validate token expiration
    this.isAuthenticatedSignal.set(!!token);
  }

  /**
   * Get Current User
   *
   * @returns User object from localStorage or null
   * Why: Provides access to user data without additional API calls
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
