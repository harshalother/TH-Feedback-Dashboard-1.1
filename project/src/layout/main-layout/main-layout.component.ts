import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Main Layout Component
 *
 * Purpose: Provides the persistent shell structure for the authenticated application
 * This component wraps all authenticated pages with a consistent sidebar, header, and content area
 *
 * Why RouterModule: Enables router-outlet and routerLink directives
 * Why RouterOutlet: Acts as a placeholder where child route components are rendered dynamically
 *
 * Layout Structure:
 * ┌─────────────────────────────────────┐
 * │          Header (Top)               │
 * ├──────────┬──────────────────────────┤
 * │          │                          │
 * │ Sidebar  │   Content Area           │
 * │ (Left)   │   <router-outlet />      │
 * │          │   (Child routes render   │
 * │          │    here dynamically)     │
 * └──────────┴──────────────────────────┘
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  // Get current user information for header display
  user = this.authService.getCurrentUser();

  // Track which store is selected in the global filter
  selectedStore = signal<string>('All Stores');

  // Sidebar navigation items
  // Why array structure: Easy to iterate and maintain navigation links
  navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/reviews', label: 'All Reviews', icon: '💬' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/reports', label: 'Reports', icon: '📋' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  // Mock store list for dropdown
  // In production, this would come from an API
  stores = [
    'All Stores',
    'Downtown Toronto',
    'Mississauga Square One',
    'North York Center',
    'Scarborough Town',
    'Etobicoke Mall'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Check if a route is currently active
   *
   * @param path - The route path to check
   * @returns boolean - True if the current route matches
   *
   * Why: Used to highlight the active navigation item
   * Why exact: false - Matches child routes (e.g., /dashboard/details)
   */
  isActiveRoute(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  /**
   * Handle store selection change
   *
   * @param event - The select change event
   *
   * Purpose: Updates the global store filter
   * In production, this would trigger data refresh across the app
   */
  onStoreChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStore.set(target.value);
    // TODO: Implement global store filter logic
  }

  /**
   * Logout Handler
   *
   * Purpose: Clears session and redirects to login
   */
  logout(): void {
    this.authService.logout();
  }
}
