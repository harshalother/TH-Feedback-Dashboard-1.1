import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { appConfig } from './app/app.config';

/**
 * Root Application Component
 *
 * Purpose: Entry point component that hosts the router outlet
 *
 * Why RouterOutlet: Provides a placeholder where routed components will be displayed
 * Why standalone: Modern Angular approach - no need for NgModule
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Router Outlet: All routed components render here -->
    <router-outlet />
  `,
})
export class App {}

/**
 * Bootstrap Application
 *
 * Purpose: Initializes the Angular application with root component and configuration
 *
 * Why bootstrapApplication: Modern standalone component bootstrap approach
 * appConfig provides all necessary providers (routing, HTTP, interceptors)
 */
bootstrapApplication(App, appConfig);
