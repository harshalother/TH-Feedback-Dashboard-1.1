import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChannelPerfData {
  channel: string;
  speed: number;
  sentiment: number;
}

interface StoreData {
  id: string;
  name: string;
  nss: number;
  volume: number;
  channel: 'swiggy' | 'zomato' | 'instore';
}

interface HeatmapCell {
  day: string;
  timeSlot: string;
  sentimentScore: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  // Active tab state
  activeTab = signal<'channel' | 'stores' | 'heatmap'>('channel');

  // Channel Performance Data
  channelPerfData = signal<ChannelPerfData[]>([]);
  isLoadingChannelPerf = signal<boolean>(true);

  // Store Data
  allStores = signal<StoreData[]>([]);
  storeSearchQuery = signal<string>('');
  isLoadingStores = signal<boolean>(true);

  // Heatmap Data
  heatmapData = signal<HeatmapCell[]>([]);
  isLoadingHeatmap = signal<boolean>(true);

  // Unique days and time slots for heatmap grid
  heatmapDays = signal<string[]>([]);
  heatmapTimeSlots = signal<string[]>([]);

  /**
   * Filtered Stores - Computed Signal
   *
   * Purpose: Filter stores based on search query
   * Dependencies: allStores, storeSearchQuery
   */
  filteredStores = computed(() => {
    const query = this.storeSearchQuery().toLowerCase().trim();
    if (!query) return this.allStores();

    return this.allStores().filter(store =>
      store.name.toLowerCase().includes(query)
    );
  });

  // Statistics
  avgChannelSentiment = computed(() => {
    const data = this.channelPerfData();
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.sentiment, 0);
    return (sum / data.length).toFixed(1);
  });

  avgStoreNSS = computed(() => {
    const stores = this.allStores();
    if (stores.length === 0) return 0;
    const sum = stores.reduce((acc, store) => acc + store.nss, 0);
    return (sum / stores.length).toFixed(1);
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadChannelPerformance();
    this.loadStoreData();
    this.loadHeatmapData();
  }

  /**
   * Load Channel Performance Data
   *
   * Purpose: Fetch Swiggy vs Zomato performance metrics
   */
  private loadChannelPerformance(): void {
    this.isLoadingChannelPerf.set(true);
    this.http.get<ChannelPerfData[]>('/api/analytics/channel-perf').subscribe({
      next: (data) => {
        this.channelPerfData.set(data);
        this.isLoadingChannelPerf.set(false);
      },
      error: (error) => {
        console.error('Error loading channel performance:', error);
        this.isLoadingChannelPerf.set(false);
      }
    });
  }

  /**
   * Load Store Data
   *
   * Purpose: Fetch all stores with NSS scores for deep dive analysis
   */
  private loadStoreData(): void {
    this.isLoadingStores.set(true);
    this.http.get<StoreData[]>('/api/analytics/stores').subscribe({
      next: (data) => {
        this.allStores.set(data);
        this.isLoadingStores.set(false);
      },
      error: (error) => {
        console.error('Error loading store data:', error);
        this.isLoadingStores.set(false);
      }
    });
  }

  /**
   * Load Heatmap Data
   *
   * Purpose: Fetch sentiment data for 7x4 grid (Days x Time Slots)
   * Grid: 7 Days (Mon-Sun) x 4 Time Slots (Morning, Afternoon, Evening, Night)
   */
  private loadHeatmapData(): void {
    this.isLoadingHeatmap.set(true);
    this.http.get<{ data: HeatmapCell[]; days: string[]; timeSlots: string[] }>('/api/analytics/heatmap').subscribe({
      next: (response) => {
        this.heatmapData.set(response.data);
        this.heatmapDays.set(response.days);
        this.heatmapTimeSlots.set(response.timeSlots);
        this.isLoadingHeatmap.set(false);
      },
      error: (error) => {
        console.error('Error loading heatmap data:', error);
        this.isLoadingHeatmap.set(false);
      }
    });
  }

  /**
   * Switch Active Tab
   *
   * @param tab - The tab to activate
   */
  switchTab(tab: 'channel' | 'stores' | 'heatmap'): void {
    this.activeTab.set(tab);
  }

  /**
   * Get Heatmap Cell Color Based on Sentiment Score
   *
   * Purpose: Map sentiment score (0-100) to color gradient
   * Green = High sentiment (75-100)
   * Yellow = Neutral sentiment (40-74)
   * Red = Low sentiment (0-39)
   *
   * @param score - Sentiment score (0-100)
   * @returns string - Tailwind color classes
   */
  getHeatmapCellColor(score: number): string {
    if (score >= 75) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  /**
   * Get Heatmap Cell Data
   *
   * Purpose: Retrieve sentiment score for a specific day and time slot
   *
   * @param day - Day name
   * @param timeSlot - Time slot name
   * @returns number - Sentiment score or 0 if not found
   */
  getHeatmapCellData(day: string, timeSlot: string): number {
    const cell = this.heatmapData().find(
      c => c.day === day && c.timeSlot === timeSlot
    );
    return cell?.sentimentScore || 0;
  }

  /**
   * Calculate Bar Chart Height
   *
   * Purpose: Scale metric values to percentage for visual bar display
   * Used for channel performance comparison
   *
   * @param value - Metric value
   * @returns string - CSS height percentage
   */
  getBarHeight(value: number): string {
    return `${(value / 100) * 100}%`;
  }

  /**
   * Get Channel Icon
   *
   * @param channel - Channel name
   * @returns string - Emoji icon
   */
  getChannelIcon(channel: string): string {
    const icons: Record<string, string> = {
      swiggy: '🍔',
      zomato: '🍕',
      instore: '🏪'
    };
    return icons[channel] || '💬';
  }

  /**
   * Get NSS Badge Color
   *
   * @param nss - NSS score
   * @returns string - Tailwind color classes
   */
  getNSSBadgeColor(nss: number): string {
    if (nss >= 80) return 'bg-green-100 text-green-800';
    if (nss >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }
}
