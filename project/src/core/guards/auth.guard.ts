import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard
 *
 * Purpose: Protects routes from unauthorized access
 * Redirects unauthenticated users to login page
 *
 * Why functional guard: Modern Angular approach, easier to test and compose
 *
 * Usage: Add to route definition - canActivate: [authGuard]
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  // Why (): Signals require invocation to get current value
  if (authService.isAuthenticated()) {
    return true;
  }

  // Not authenticated - redirect to login
  // Why navigateByUrl: Returns a UrlTree for Angular router
  return router.createUrlTree(['/login']);
};
