import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

/**
 * Application Routes Configuration
 *
 * Purpose: Defines all navigation paths and their hierarchy
 *
 * Route Structure:
 * - Login (public) - Standalone route outside the layout
 * - MainLayout (protected) - Parent route that provides the shell
 *   └── Child routes (dashboard, reviews, etc.) - Render inside layout's router-outlet
 *
 * Why this structure:
 * - Separates authenticated and public routes
 * - MainLayout wraps all authenticated pages with persistent navigation
 * - Child routes inherit authentication from parent
 *
 * How router-outlet works with nested routes:
 * 1. App component has <router-outlet> that renders top-level routes (Login or MainLayout)
 * 2. MainLayout has its own <router-outlet> that renders child routes
 * 3. When navigating to /dashboard, Angular renders:
 *    App → MainLayout → DashboardComponent
 */
export const routes: Routes = [
  // Default route - redirect to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Login route - publicly accessible, outside main layout
  {
    path: 'login',
    loadComponent: () => import('../features/login/login.component').then(m => m.LoginComponent)
  },

  // Main Layout - Parent route for all authenticated pages
  // This route provides the persistent sidebar and header
  {
    path: '',
    loadComponent: () => import('../layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard], // Protects all child routes
    children: [
      // Dashboard - Landing page after login
      {
        path: 'dashboard',
        loadComponent: () => import('../features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // All Reviews - View and manage customer feedback
      {
        path: 'reviews',
        loadComponent: () => import('../features/reviews/reviews.component').then(m => m.ReviewsComponent)
      },

      // Analytics - Data insights and visualizations
      {
        path: 'analytics',
        loadComponent: () => import('../features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },

      // Reports - Generate and export reports
      {
        path: 'reports',
        loadComponent: () => import('../features/reports/reports.component').then(m => m.ReportsComponent)
      },

      // Settings - Application configuration
      {
        path: 'settings',
        loadComponent: () => import('../features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },

  // Wildcard route - catch all undefined routes
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
