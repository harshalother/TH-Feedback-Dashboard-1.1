import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, ReportSchedule } from '../../core/services/report.service';

/**
 * Reports Component
 *
 * Purpose: Provides interface for downloading reports and viewing scheduled reports
 *
 * Key Features:
 * - On-demand report generation (CSV and PDF formats)
 * - File download simulation using browser APIs
 * - Display of scheduled report configurations
 *
 * Why standalone: Modern Angular approach with explicit dependencies
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  // Loading states for download buttons
  isDownloadingCSV = signal<boolean>(false);
  isDownloadingPDF = signal<boolean>(false);

  // Scheduled reports data
  scheduledReports = signal<ReportSchedule[]>([]);
  isLoadingSchedules = signal<boolean>(true);

  // Success/error messages
  downloadMessage = signal<string>('');
  messageType = signal<'success' | 'error'>('success');

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadScheduledReports();
  }

  /**
   * Load scheduled reports from API
   *
   * Purpose: Fetch and display active report schedules
   */
  private loadScheduledReports(): void {
    this.isLoadingSchedules.set(true);
    this.reportService.getScheduledReports().subscribe({
      next: (schedules) => {
        this.scheduledReports.set(schedules);
        this.isLoadingSchedules.set(false);
      },
      error: (error) => {
        console.error('Error loading scheduled reports:', error);
        this.isLoadingSchedules.set(false);
      }
    });
  }

  /**
   * Download CSV Report
   *
   * Purpose: Request CSV file from API and trigger browser download
   *
   * Process:
   * 1. Set loading state
   * 2. Call API to get blob data
   * 3. Use service method to trigger download
   * 4. Show success/error message
   */
  downloadCSV(): void {
    this.isDownloadingCSV.set(true);
    this.clearMessage();

    this.reportService.downloadReport('csv').subscribe({
      next: (blob) => {
        // Generate filename with current date
        const filename = `feedback-report-${this.getCurrentDate()}.csv`;

        // Trigger browser download
        this.reportService.triggerDownload(blob, filename);

        this.isDownloadingCSV.set(false);
        this.showMessage('CSV report downloaded successfully', 'success');
      },
      error: (error) => {
        console.error('Error downloading CSV:', error);
        this.isDownloadingCSV.set(false);
        this.showMessage('Failed to download CSV report', 'error');
      }
    });
  }

  /**
   * Download PDF Report
   *
   * Purpose: Request PDF file from API and trigger browser download
   */
  downloadPDF(): void {
    this.isDownloadingPDF.set(true);
    this.clearMessage();

    this.reportService.downloadReport('pdf').subscribe({
      next: (blob) => {
        // Generate filename with current date
        const filename = `executive-report-${this.getCurrentDate()}.pdf`;

        // Trigger browser download
        this.reportService.triggerDownload(blob, filename);

        this.isDownloadingPDF.set(false);
        this.showMessage('PDF report downloaded successfully', 'success');
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
        this.isDownloadingPDF.set(false);
        this.showMessage('Failed to download PDF report', 'error');
      }
    });
  }

  /**
   * Get current date in YYYY-MM-DD format
   *
   * @returns string - Formatted date for filenames
   */
  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Show feedback message to user
   *
   * @param message - Message text
   * @param type - Message type (success or error)
   */
  private showMessage(message: string, type: 'success' | 'error'): void {
    this.downloadMessage.set(message);
    this.messageType.set(type);

    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.clearMessage();
    }, 5000);
  }

  /**
   * Clear feedback message
   */
  private clearMessage(): void {
    this.downloadMessage.set('');
  }

  /**
   * Get frequency badge color classes
   *
   * @param frequency - Report frequency
   * @returns string - Tailwind classes for badge styling
   */
  getFrequencyBadgeClass(frequency: string): string {
    const classes: Record<string, string> = {
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800'
    };
    return classes[frequency] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format recipients list for display
   *
   * @param recipients - Array of email addresses
   * @returns string - Comma-separated list
   */
  formatRecipients(recipients: string[]): string {
    if (recipients.length <= 2) {
      return recipients.join(', ');
    }
    return `${recipients.slice(0, 2).join(', ')} +${recipients.length - 2} more`;
  }
}
