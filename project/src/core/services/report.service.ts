import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Report Data Models
 *
 * Purpose: Type definitions for report operations
 */

export interface ReportSchedule {
  id: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastRun: string;
  nextRun: string;
}

/**
 * Report Service
 *
 * Purpose: Manages all report-related operations
 * Handles downloading reports and fetching scheduled report information
 *
 * Why Injectable: Allows dependency injection throughout the app
 * Why providedIn 'root': Singleton service shared across components
 */
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = '/api/reports';

  constructor(private http: HttpClient) {}

  /**
   * Download a report file
   *
   * @param reportType - Type of report to download (csv or pdf)
   * @returns Observable<Blob> - Binary data for file download
   *
   * Why Blob: Represents raw binary data that can be saved as a file
   * Why responseType blob: Tells Angular to expect binary data instead of JSON
   */
  downloadReport(reportType: 'csv' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download?type=${reportType}`, {
      responseType: 'blob'
    });
  }

  /**
   * Fetch list of scheduled reports
   *
   * @returns Observable<ReportSchedule[]> - Stream of scheduled report data
   *
   * Why: Displays active automated report schedules
   */
  getScheduledReports(): Observable<ReportSchedule[]> {
    return this.http.get<ReportSchedule[]>(`${this.apiUrl}/schedules`);
  }

  /**
   * Trigger browser download of a Blob
   *
   * Purpose: Creates a temporary download link and triggers it
   * This is the standard approach for client-side file downloads
   *
   * @param blob - The file data
   * @param filename - Name for the downloaded file
   *
   * How it works:
   * 1. Create an object URL from the blob data
   * 2. Create a temporary anchor element
   * 3. Set download attribute with filename
   * 4. Programmatically click the link to trigger download
   * 5. Clean up the object URL and DOM element
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
