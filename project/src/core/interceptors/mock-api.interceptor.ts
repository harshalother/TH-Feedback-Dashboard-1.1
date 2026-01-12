import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Mock API Interceptor
 *
 * Purpose: Simulates backend API responses for development without requiring a real backend.
 * This interceptor catches HTTP requests and returns realistic mock data based on the endpoint.
 *
 * Why: Allows frontend development to proceed independently of backend availability.
 * The delay() operator simulates network latency for a more realistic experience.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {

  // Check if this is a login request
  if (req.url.includes('/api/auth/login') && req.method === 'POST') {
    // Extract credentials from request body for validation
    const body = req.body as { email: string; password: string };

    // Simulate basic validation - in a real app, this happens on the backend
    // We're accepting any non-empty credentials for demo purposes
    if (body.email && body.password) {
      // Create a realistic mock response with JWT token and user data
      const mockResponse = {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email: body.email,
          name: 'John Doe',
          role: 'admin'
        }
      };

      // Return the mock response with a simulated network delay (500ms)
      // This makes the loading state visible and feels more realistic
      return of(new HttpResponse({
        status: 200,
        body: mockResponse
      })).pipe(delay(500));
    } else {
      // Return error response for invalid credentials
      return of(new HttpResponse({
        status: 401,
        body: {
          success: false,
          message: 'Invalid email or password'
        }
      })).pipe(delay(500));
    }
  }

  // Check if this is a dashboard stats request
  if (req.url.includes('/api/dashboard/stats') && req.method === 'GET') {
    // Generate realistic dashboard data with KPIs and chart data
    const mockResponse = {
      kpis: {
        nss: 45,
        sla: 92,
        rating: 4.2,
        pending: 12,
        volume: 1240
      },
      charts: {
        // NSS Trend over last 7 days
        nssTrend: [
          { day: 'Mon', value: 38 },
          { day: 'Tue', value: 42 },
          { day: 'Wed', value: 40 },
          { day: 'Thu', value: 44 },
          { day: 'Fri', value: 48 },
          { day: 'Sat', value: 46 },
          { day: 'Sun', value: 45 }
        ],
        // Channel distribution of feedback volume
        channelShare: {
          swiggy: 40,
          zomato: 30,
          instore: 30
        },
        // Top 5 stores by volume
        topStores: [
          { name: 'Downtown Toronto', volume: 245, nss: 48 },
          { name: 'Mississauga Square One', volume: 198, nss: 42 },
          { name: 'North York Center', volume: 187, nss: 45 },
          { name: 'Scarborough Town', volume: 156, nss: 43 },
          { name: 'Etobicoke Mall', volume: 134, nss: 41 }
        ]
      }
    };

    // Return the mock response with a simulated network delay (800ms)
    return of(new HttpResponse({
      status: 200,
      body: mockResponse
    })).pipe(delay(800));
  }

  // Check if this is a reviews list request
  if (req.url.includes('/api/reviews') && req.method === 'GET' && !req.url.includes('/reply')) {
    // Generate 20 realistic customer reviews with varied data
    // Each review includes: date, source channel, store location, rating, text, sentiment analysis, and status
    const mockReviews = [
      {
        id: 'rev-001',
        date: '2026-01-12',
        source: 'swiggy',
        store: 'Downtown Toronto',
        rating: 5,
        text: 'Amazing coffee and excellent service! The double-double was perfect and the staff was very friendly. Will definitely order again.',
        sentiment: 'positive',
        status: 'pending'
      },
      {
        id: 'rev-002',
        date: '2026-01-12',
        source: 'zomato',
        store: 'Mississauga Square One',
        rating: 4,
        text: 'Good food quality but delivery took a bit longer than expected. The donuts were fresh though.',
        sentiment: 'neutral',
        status: 'pending'
      },
      {
        id: 'rev-003',
        date: '2026-01-11',
        source: 'instore',
        store: 'North York Center',
        rating: 5,
        text: 'Love the new breakfast sandwich options! Always a great experience at this location. The staff remembers my order.',
        sentiment: 'positive',
        status: 'replied'
      },
      {
        id: 'rev-004',
        date: '2026-01-11',
        source: 'swiggy',
        store: 'Scarborough Town',
        rating: 2,
        text: 'Order was incomplete and the coffee was lukewarm. Expected better quality for the price.',
        sentiment: 'negative',
        status: 'pending'
      },
      {
        id: 'rev-005',
        date: '2026-01-11',
        source: 'zomato',
        store: 'Etobicoke Mall',
        rating: 5,
        text: 'Best Timbits ever! Perfectly fresh and the variety was great. Fast delivery too.',
        sentiment: 'positive',
        status: 'resolved'
      },
      {
        id: 'rev-006',
        date: '2026-01-10',
        source: 'instore',
        store: 'Downtown Toronto',
        rating: 4,
        text: 'Nice ambiance and clean store. Coffee was good but the line was a bit long during lunch hour.',
        sentiment: 'neutral',
        status: 'replied'
      },
      {
        id: 'rev-007',
        date: '2026-01-10',
        source: 'swiggy',
        store: 'Mississauga Square One',
        rating: 1,
        text: 'Very disappointed. Order arrived cold and missing items. Customer service did not respond to my complaint.',
        sentiment: 'negative',
        status: 'pending'
      },
      {
        id: 'rev-008',
        date: '2026-01-10',
        source: 'zomato',
        store: 'North York Center',
        rating: 5,
        text: 'Exceptional service and quality! The iced capp was perfect on this hot day. Delivery was super fast.',
        sentiment: 'positive',
        status: 'resolved'
      },
      {
        id: 'rev-009',
        date: '2026-01-09',
        source: 'instore',
        store: 'Scarborough Town',
        rating: 3,
        text: 'Average experience. Nothing special but nothing wrong either. Coffee was okay.',
        sentiment: 'neutral',
        status: 'replied'
      },
      {
        id: 'rev-010',
        date: '2026-01-09',
        source: 'swiggy',
        store: 'Etobicoke Mall',
        rating: 4,
        text: 'Good breakfast wrap and timely delivery. Would appreciate if they added more sauce options.',
        sentiment: 'positive',
        status: 'pending'
      },
      {
        id: 'rev-011',
        date: '2026-01-09',
        source: 'zomato',
        store: 'Downtown Toronto',
        rating: 5,
        text: 'Always reliable! My go-to place for coffee and breakfast. Never been disappointed.',
        sentiment: 'positive',
        status: 'resolved'
      },
      {
        id: 'rev-012',
        date: '2026-01-08',
        source: 'instore',
        store: 'Mississauga Square One',
        rating: 2,
        text: 'The store was understaffed and the wait time was too long. Coffee was cold by the time I got it.',
        sentiment: 'negative',
        status: 'pending'
      },
      {
        id: 'rev-013',
        date: '2026-01-08',
        source: 'swiggy',
        store: 'North York Center',
        rating: 5,
        text: 'Perfect order! Everything was fresh and hot. The packaging was also very good.',
        sentiment: 'positive',
        status: 'replied'
      },
      {
        id: 'rev-014',
        date: '2026-01-08',
        source: 'zomato',
        store: 'Scarborough Town',
        rating: 4,
        text: 'Great taste as always. Delivery packaging could be better to keep items warm.',
        sentiment: 'neutral',
        status: 'resolved'
      },
      {
        id: 'rev-015',
        date: '2026-01-07',
        source: 'instore',
        store: 'Etobicoke Mall',
        rating: 5,
        text: 'Fantastic customer service! The manager personally ensured my order was perfect. Very impressed.',
        sentiment: 'positive',
        status: 'replied'
      },
      {
        id: 'rev-016',
        date: '2026-01-07',
        source: 'swiggy',
        store: 'Downtown Toronto',
        rating: 3,
        text: 'Decent food but delivery was delayed. Expected faster service during non-peak hours.',
        sentiment: 'neutral',
        status: 'pending'
      },
      {
        id: 'rev-017',
        date: '2026-01-07',
        source: 'zomato',
        store: 'Mississauga Square One',
        rating: 1,
        text: 'Wrong order delivered twice. Very frustrating experience. Will not order again.',
        sentiment: 'negative',
        status: 'pending'
      },
      {
        id: 'rev-018',
        date: '2026-01-06',
        source: 'instore',
        store: 'North York Center',
        rating: 5,
        text: 'Love this location! Staff is always cheerful and the coffee is consistently good.',
        sentiment: 'positive',
        status: 'resolved'
      },
      {
        id: 'rev-019',
        date: '2026-01-06',
        source: 'swiggy',
        store: 'Scarborough Town',
        rating: 4,
        text: 'Good quality and reasonable prices. Just wish they had more vegetarian options.',
        sentiment: 'positive',
        status: 'replied'
      },
      {
        id: 'rev-020',
        date: '2026-01-06',
        source: 'zomato',
        store: 'Etobicoke Mall',
        rating: 3,
        text: 'Standard Tim Hortons experience. Nothing to complain about but nothing extraordinary either.',
        sentiment: 'neutral',
        status: 'resolved'
      }
    ];

    // Return mock reviews with simulated network delay (600ms)
    return of(new HttpResponse({
      status: 200,
      body: mockReviews
    })).pipe(delay(600));
  }

  // Check if this is a reply submission request
  if (req.url.includes('/api/reviews/reply') && req.method === 'POST') {
    // Extract reply data from request body
    const body = req.body as { reviewId: string; replyText: string };

    // Validate that both fields are present
    if (body.reviewId && body.replyText) {
      // Simulate successful reply submission
      const mockResponse = {
        success: true,
        message: 'Reply sent successfully to the customer'
      };

      // Return success response with simulated network delay (400ms)
      return of(new HttpResponse({
        status: 200,
        body: mockResponse
      })).pipe(delay(400));
    } else {
      // Return error response for invalid data
      return of(new HttpResponse({
        status: 400,
        body: {
          success: false,
          message: 'Invalid reply data'
        }
      })).pipe(delay(400));
    }
  }

  // Check if this is a channel performance request
  if (req.url.includes('/api/analytics/channel-perf') && req.method === 'GET') {
    // Generate comparative performance data for Swiggy vs Zomato
    // Metrics: Speed (delivery speed score 0-100) and Sentiment (customer sentiment 0-100)
    const mockChannelPerf = [
      {
        channel: 'swiggy',
        speed: 85,
        sentiment: 78
      },
      {
        channel: 'zomato',
        speed: 79,
        sentiment: 82
      },
      {
        channel: 'instore',
        speed: 92,
        sentiment: 88
      }
    ];

    // Return mock data with simulated network delay (500ms)
    return of(new HttpResponse({
      status: 200,
      body: mockChannelPerf
    })).pipe(delay(500));
  }

  // Check if this is a store data request
  if (req.url.includes('/api/analytics/stores') && req.method === 'GET') {
    // Generate store list with NSS scores and review volume
    const mockStores = [
      { id: '1', name: 'Downtown Toronto', nss: 82, volume: 245, channel: 'swiggy' as const },
      { id: '2', name: 'Mississauga Square One', nss: 76, volume: 198, channel: 'zomato' as const },
      { id: '3', name: 'North York Center', nss: 88, volume: 187, channel: 'instore' as const },
      { id: '4', name: 'Scarborough Town', nss: 64, volume: 156, channel: 'swiggy' as const },
      { id: '5', name: 'Etobicoke Mall', nss: 79, volume: 134, channel: 'zomato' as const },
      { id: '6', name: 'Vaughan Mills', nss: 85, volume: 142, channel: 'instore' as const },
      { id: '7', name: 'Markham Station', nss: 72, volume: 118, channel: 'swiggy' as const },
      { id: '8', name: 'Ajax Downtown', nss: 81, volume: 125, channel: 'zomato' as const },
      { id: '9', name: 'Pickering Plaza', nss: 75, volume: 97, channel: 'instore' as const },
      { id: '10', name: 'Richmond Hill Center', nss: 87, volume: 167, channel: 'swiggy' as const }
    ];

    // Return mock data with simulated network delay (600ms)
    return of(new HttpResponse({
      status: 200,
      body: mockStores
    })).pipe(delay(600));
  }

  // Check if this is a heatmap data request
  if (req.url.includes('/api/analytics/heatmap') && req.method === 'GET') {
    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Time slots
    const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];

    // Generate heatmap data: 7 days x 4 time slots with sentiment scores (0-100)
    // Pattern: Higher sentiment during lunch hours and weekends
    const heatmapData: Array<{ day: string; timeSlot: string; sentimentScore: number }> = [];

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((timeSlot, timeIndex) => {
        // Create sentiment patterns
        let baseScore = 60;

        // Boost sentiment during peak hours (Afternoon)
        if (timeIndex === 1) baseScore += 15;

        // Boost sentiment on weekends
        if (dayIndex >= 5) baseScore += 10;

        // Add some variation
        const variation = Math.sin(dayIndex * 0.5 + timeIndex * 0.3) * 15;
        const score = Math.min(100, Math.max(0, baseScore + variation));

        heatmapData.push({
          day,
          timeSlot,
          sentimentScore: Math.round(score)
        });
      });
    });

    // Return mock data with structured response
    const mockResponse = {
      data: heatmapData,
      days,
      timeSlots
    };

    // Return mock data with simulated network delay (700ms)
    return of(new HttpResponse({
      status: 200,
      body: mockResponse
    })).pipe(delay(700));
  }

  // Check if this is a report download request
  if (req.url.includes('/api/reports/download') && req.method === 'GET') {
    // Extract report type from query params
    const url = new URL(req.url, 'http://localhost');
    const reportType = url.searchParams.get('type');

    // Generate mock file content based on type
    let blobContent: string;
    let contentType: string;

    if (reportType === 'csv') {
      // Generate mock CSV content
      // Header row with column names
      blobContent = 'ID,Date,Source,Store,Rating,Sentiment,Status,Review Text\n';

      // Add sample data rows
      blobContent += 'rev-001,2026-01-12,swiggy,Downtown Toronto,5,positive,pending,"Amazing coffee and excellent service"\n';
      blobContent += 'rev-002,2026-01-12,zomato,Mississauga Square One,4,neutral,pending,"Good food quality"\n';
      blobContent += 'rev-003,2026-01-11,instore,North York Center,5,positive,replied,"Love the new breakfast options"\n';
      blobContent += 'rev-004,2026-01-11,swiggy,Scarborough Town,2,negative,pending,"Order was incomplete"\n';
      blobContent += 'rev-005,2026-01-11,zomato,Etobicoke Mall,5,positive,resolved,"Best Timbits ever"\n';

      contentType = 'text/csv';
    } else if (reportType === 'pdf') {
      // Generate mock PDF content (simplified text representation)
      // In a real scenario, this would be actual PDF binary data
      blobContent = `
EXECUTIVE REPORT - FEEDBACK ANALYTICS
Generated: ${new Date().toLocaleDateString()}
========================================

KEY PERFORMANCE INDICATORS
---------------------------
Net Sentiment Score: 45%
Service Level Agreement: 92%
Average Rating: 4.2/5.0
Pending Items: 12
Total Volume: 1,240 reviews

TOP PERFORMING STORES
---------------------
1. Downtown Toronto - 245 reviews (NSS: 48%)
2. Mississauga Square One - 198 reviews (NSS: 42%)
3. North York Center - 187 reviews (NSS: 45%)

INSIGHTS & RECOMMENDATIONS
--------------------------
- Continue focus on customer service excellence
- Address pending items to improve SLA
- Maintain quality standards across all channels

This is a simulated PDF document for development purposes.
      `;
      contentType = 'application/pdf';
    } else {
      // Default to plain text
      blobContent = 'Unknown report type';
      contentType = 'text/plain';
    }

    // Create a Blob from the content
    const blob = new Blob([blobContent], { type: contentType });

    // Return the blob as HttpResponse
    // Note: In Angular HttpClient, when responseType is 'blob',
    // the response body is automatically converted to a Blob
    return of(new HttpResponse({
      status: 200,
      body: blob
    })).pipe(delay(1000)); // Longer delay to simulate file generation
  }

  // Check if this is a scheduled reports request
  if (req.url.includes('/api/reports/schedules') && req.method === 'GET') {
    // Generate mock scheduled report configurations
    const mockSchedules = [
      {
        id: 'sched-001',
        reportName: 'Daily NSS Summary',
        frequency: 'daily' as const,
        recipients: ['manager@timhortons.com', 'director@timhortons.com'],
        lastRun: '2026-01-12 08:00',
        nextRun: '2026-01-13 08:00'
      },
      {
        id: 'sched-002',
        reportName: 'Weekly Performance Report',
        frequency: 'weekly' as const,
        recipients: ['team@timhortons.com', 'analytics@timhortons.com', 'ops@timhortons.com'],
        lastRun: '2026-01-05 09:00',
        nextRun: '2026-01-12 09:00'
      },
      {
        id: 'sched-003',
        reportName: 'Monthly Executive Summary',
        frequency: 'monthly' as const,
        recipients: ['exec@timhortons.com', 'ceo@timhortons.com'],
        lastRun: '2026-01-01 10:00',
        nextRun: '2026-02-01 10:00'
      },
      {
        id: 'sched-004',
        reportName: 'Weekly Store Rankings',
        frequency: 'weekly' as const,
        recipients: ['stores@timhortons.com', 'regional@timhortons.com'],
        lastRun: '2026-01-05 07:00',
        nextRun: '2026-01-12 07:00'
      }
    ];

    // Return mock data with simulated network delay (500ms)
    return of(new HttpResponse({
      status: 200,
      body: mockSchedules
    })).pipe(delay(500));
  }

  // Check if this is a settings fetch request
  if (req.url.includes('/api/settings') && req.method === 'GET') {
    // Return current application settings/configuration
    const mockSettings = {
      sentimentAnalysis: true,
      darkMode: false,
      autoReplyRules: [
        {
          id: 'rule-001',
          trigger: 'negative',
          message: 'Thank you for your feedback. We apologize for the experience. Our team will contact you shortly to resolve this.'
        },
        {
          id: 'rule-002',
          trigger: 'positive',
          message: 'Thank you for your positive feedback! We appreciate your business and look forward to serving you again.'
        },
        {
          id: 'rule-003',
          trigger: 'neutral',
          message: 'Thank you for taking the time to share your feedback with us.'
        }
      ]
    };

    // Return settings with simulated network delay (400ms)
    return of(new HttpResponse({
      status: 200,
      body: mockSettings
    })).pipe(delay(400));
  }

  // Check if this is a settings update request
  if (req.url.includes('/api/settings') && req.method === 'PUT') {
    // Extract updated settings from request body
    const body = req.body as any;

    // Validate that required fields are present
    if (body && 'sentimentAnalysis' in body && 'darkMode' in body && 'autoReplyRules' in body) {
      // Simulate successful settings update
      const mockResponse = {
        success: true,
        message: 'Settings saved successfully',
        data: body
      };

      // Return success response with simulated network delay (600ms)
      return of(new HttpResponse({
        status: 200,
        body: mockResponse
      })).pipe(delay(600));
    } else {
      // Return error response for invalid data
      return of(new HttpResponse({
        status: 400,
        body: {
          success: false,
          message: 'Invalid settings data'
        }
      })).pipe(delay(400));
    }
  }

  // For all other requests, pass through to the next handler
  // This allows adding more mock endpoints in the future
  return next(req);
};
