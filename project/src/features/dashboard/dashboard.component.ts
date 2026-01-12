import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

/**
 * Dashboard Component
 *
 * Purpose: Main landing page after login showing overview and key metrics
 * Displays KPIs, trend charts, and store performance data
 *
 * Why separate component logic from template:
 * - Keeps template clean and focused on presentation
 * - Makes component logic testable
 * - Signal-based reactivity for efficient change detection
 *
 * Why NgChartsModule: Ng2-charts integration for Chart.js visualization
 * Why HttpClientModule: Required for dashboard service HTTP calls
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, HttpClientModule],
  template: `
    <!-- Dashboard Content -->
    <div class="space-y-6">

      <!-- Page Header -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-3xl font-bold text-secondary mb-2">
          Dashboard
        </h1>
        <p class="text-secondary/70">
          Welcome back, {{ user?.name }}! Here's your feedback overview.
        </p>
      </div>

      <!-- KPI Cards Row 1 -->
      @if (dashboardData(); as data) {
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">

          <!-- NSS (Net Sentiment Score) Card -->
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-secondary/70">NSS</h3>
              <span class="text-2xl">📊</span>
            </div>
            <p class="text-3xl font-bold text-secondary">{{ data.kpis.nss }}%</p>
            <p class="text-xs text-secondary/60 mt-1">Net Sentiment Score</p>
          </div>

          <!-- SLA (Service Level Agreement) Card -->
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-secondary/70">SLA</h3>
              <span class="text-2xl">✓</span>
            </div>
            <p class="text-3xl font-bold text-secondary">{{ data.kpis.sla }}%</p>
            <p class="text-xs text-green-600 mt-1">Service Level</p>
          </div>

          <!-- Average Rating Card -->
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-secondary/70">Rating</h3>
              <span class="text-2xl">⭐</span>
            </div>
            <p class="text-3xl font-bold text-secondary">{{ data.kpis.rating }}</p>
            <p class="text-xs text-secondary/60 mt-1">out of 5.0</p>
          </div>

          <!-- Pending Tickets Card -->
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-secondary/70">Pending</h3>
              <span class="text-2xl">⏳</span>
            </div>
            <p class="text-3xl font-bold text-secondary">{{ data.kpis.pending }}</p>
            <p class="text-xs text-secondary/60 mt-1">Pending Items</p>
          </div>

          <!-- Total Volume Card -->
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-secondary/70">Volume</h3>
              <span class="text-2xl">📈</span>
            </div>
            <p class="text-3xl font-bold text-secondary">{{ data.kpis.volume }}</p>
            <p class="text-xs text-secondary/60 mt-1">Total Reviews</p>
          </div>
        </div>

        <!-- Charts Grid Row 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- NSS Trend Chart (Line Chart) -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-bold text-secondary mb-4">NSS Trend (7 Days)</h2>
            <div class="relative h-64">
              <canvas
                baseChart
                [type]="nssTrendChartConfig.type"
                [data]="nssTrendChartConfig.data"
                [options]="nssTrendChartConfig.options"
              ></canvas>
            </div>
          </div>

          <!-- Channel Share Chart (Pie Chart) -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-bold text-secondary mb-4">Feedback by Channel</h2>
            <div class="relative h-64">
              <canvas
                baseChart
                [type]="channelShareChartConfig.type"
                [data]="channelShareChartConfig.data"
                [options]="channelShareChartConfig.options"
              ></canvas>
            </div>
          </div>
        </div>

        <!-- Top 5 Stores Chart Row 3 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-bold text-secondary mb-4">Top 5 Stores by Volume</h2>
          <div class="relative h-80">
            <canvas
              baseChart
              [type]="topStoresChartConfig.type"
              [data]="topStoresChartConfig.data"
              [options]="topStoresChartConfig.options"
            ></canvas>
          </div>
        </div>

        <!-- Store Performance Table -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-bold text-secondary mb-4">Store Performance Details</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-gray-200">
                <tr>
                  <th class="text-left py-3 px-4 font-semibold text-secondary">Store Name</th>
                  <th class="text-right py-3 px-4 font-semibold text-secondary">Volume</th>
                  <th class="text-right py-3 px-4 font-semibold text-secondary">NSS Score</th>
                  <th class="text-center py-3 px-4 font-semibold text-secondary">Performance</th>
                </tr>
              </thead>
              <tbody>
                @for (store of data.charts.topStores; track store.name) {
                  <tr class="border-b border-gray-100 hover:bg-surface transition-colors">
                    <td class="py-3 px-4 text-secondary">{{ store.name }}</td>
                    <td class="py-3 px-4 text-right text-secondary font-semibold">{{ store.volume }}</td>
                    <td class="py-3 px-4 text-right font-semibold" [ngClass]="store.nss >= 45 ? 'text-green-600' : 'text-orange-600'">
                      {{ store.nss }}%
                    </td>
                    <td class="py-3 px-4 text-center">
                      @if (store.nss >= 45) {
                        <span class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Good</span>
                      } @else if (store.nss >= 40) {
                        <span class="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Fair</span>
                      } @else {
                        <span class="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Needs Work</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <!-- Loading State -->
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block animate-pulse">
              <div class="w-12 h-12 bg-secondary/20 rounded-lg mb-3"></div>
            </div>
            <p class="text-secondary/70">Loading dashboard data...</p>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  // Get current user from auth service
  user = this.authService.getCurrentUser();

  // Dashboard data signal for reactive updates
  // Signal allows Angular to only rerender when data changes
  dashboardData = signal<DashboardStats | null>(null);

  // Chart configurations
  nssTrendChartConfig!: ChartConfiguration;
  channelShareChartConfig!: ChartConfiguration;
  topStoresChartConfig!: ChartConfiguration;

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    // Effect: Whenever dashboard data changes, update chart configurations
    // This keeps charts in sync with data automatically
    effect(() => {
      const data = this.dashboardData();
      if (data) {
        this.initializeCharts(data);
      }
    });
  }

  ngOnInit(): void {
    // Fetch dashboard statistics on component initialization
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  /**
   * Initialize all chart configurations based on data
   *
   * Why separate method: Keeps ngOnInit clean and makes chart setup reusable
   */
  private initializeCharts(data: DashboardStats): void {
    this.initializeNSSTrendChart(data);
    this.initializeChannelShareChart(data);
    this.initializeTopStoresChart(data);
  }

  /**
   * Configure NSS Trend Line Chart
   *
   * Purpose: Show trend of Net Sentiment Score over 7 days
   * Why Line Chart: Best for showing trends over time
   */
  private initializeNSSTrendChart(data: DashboardStats): void {
    const days = data.charts.nssTrend.map(d => d.day);
    const values = data.charts.nssTrend.map(d => d.value);

    this.nssTrendChartConfig = {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'NSS Score',
            data: values,
            borderColor: '#C8102E',
            backgroundColor: 'rgba(200, 16, 46, 0.05)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#C8102E',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#4B3228', font: { size: 12, weight: 'bold' } }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 30,
            max: 50,
            ticks: { color: '#4B3228' },
            grid: { color: 'rgba(75, 50, 40, 0.05)' }
          },
          x: {
            ticks: { color: '#4B3228' },
            grid: { display: false }
          }
        }
      } as ChartOptions
    };
  }

  /**
   * Configure Channel Share Pie Chart
   *
   * Purpose: Show distribution of feedback across delivery platforms
   * Why Pie Chart: Excellent for showing proportions and composition
   */
  private initializeChannelShareChart(data: DashboardStats): void {
    const channelNames = Object.keys(data.charts.channelShare);
    const channelValues = Object.values(data.charts.channelShare);

    this.channelShareChartConfig = {
      type: 'doughnut',
      data: {
        labels: channelNames.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [
          {
            data: channelValues,
            backgroundColor: ['#C8102E', '#4B3228', '#D4A5A1'],
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#4B3228', font: { size: 12, weight: 'bold' }, padding: 20 }
          }
        }
      } as ChartOptions
    };
  }

  /**
   * Configure Top Stores Bar Chart
   *
   * Purpose: Display volume and NSS comparison across top 5 stores
   * Why Bar Chart: Great for comparing values across categories
   */
  private initializeTopStoresChart(data: DashboardStats): void {
    const storeNames = data.charts.topStores.map(s => s.name);
    const volumes = data.charts.topStores.map(s => s.volume);
    const nssScores = data.charts.topStores.map(s => s.nss);

    this.topStoresChartConfig = {
      type: 'bar',
      data: {
        labels: storeNames,
        datasets: [
          {
            label: 'Volume',
            data: volumes,
            backgroundColor: '#C8102E',
            borderRadius: 4
          },
          {
            label: 'NSS Score',
            data: nssScores,
            backgroundColor: '#4B3228',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            labels: { color: '#4B3228', font: { size: 12, weight: 'bold' } }
          }
        },
        scales: {
          x: {
            ticks: { color: '#4B3228' },
            grid: { color: 'rgba(75, 50, 40, 0.05)' }
          },
          y: {
            ticks: { color: '#4B3228' },
            grid: { display: false }
          }
        }
      } as ChartOptions
    };
  }
}
