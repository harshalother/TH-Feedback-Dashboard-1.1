import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

/**
 * Placeholder Component
 *
 * Purpose: Temporary component for pages under development
 * Displays a "Work in Progress" message with the page title
 *
 * Why: Allows navigation structure to be complete while features are being built
 * Why ActivatedRoute: Retrieves route data (title) passed from route configuration
 */
@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div class="text-center">
        <div class="text-6xl mb-4">🚧</div>
        <h1 class="text-3xl font-bold text-secondary mb-2">
          {{ title }}
        </h1>
        <p class="text-secondary/70 text-lg">
          This page is under construction
        </p>
      </div>
    </div>
  `
})
export class PlaceholderComponent implements OnInit {
  title: string = 'Work in Progress';

  constructor(private route: ActivatedRoute) {}

  /**
   * Initialize component with route data
   *
   * Why: Extracts the page title from route configuration
   * This makes the component reusable for different pages
   */
  ngOnInit(): void {
    // Get title from route data if available
    this.title = this.route.snapshot.data['title'] || 'Work in Progress';
  }
}
