import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../core/services/review.service';

/**
 * Reviews Component
 *
 * Purpose: Displays a unified feed of all customer reviews with filtering and reply functionality
 *
 * Key Features:
 * - Expandable rows to view full review text
 * - Inline reply interface
 * - Multi-criteria filtering (search, status, channel)
 * - Real-time UI updates using Angular signals
 *
 * Why standalone: Modern Angular approach with explicit dependencies
 */
@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  // All reviews from API
  allReviews = signal<Review[]>([]);

  // Loading state for initial data fetch
  isLoading = signal<boolean>(true);

  // Filter states
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('all');
  selectedChannel = signal<string>('all');

  /**
   * Expansion Panel State
   *
   * Purpose: Track which review row is currently expanded
   *
   * How it works:
   * - expandedReviewId stores the ID of the currently expanded review
   * - null means no review is expanded
   * - Clicking a row sets this value to that review's ID
   * - Clicking the same row again collapses it by setting back to null
   * - Only ONE review can be expanded at a time (single-select pattern)
   *
   * Why signal: Reactive state that automatically updates the template
   * Why string | null: Allows us to track "no selection" with null
   */
  expandedReviewId = signal<string | null>(null);

  // Reply form state for the expanded review
  replyText = signal<string>('');
  isSubmittingReply = signal<boolean>(false);

  // Success/error message for reply submission
  replyMessage = signal<string>('');

  /**
   * Filtered Reviews - Computed Signal
   *
   * Purpose: Automatically filter reviews based on current filter criteria
   *
   * Why computed: Automatically recalculates when dependencies change
   * Dependencies: allReviews, searchQuery, selectedStatus, selectedChannel
   *
   * Filter logic:
   * 1. Text search - matches against review text and store name (case-insensitive)
   * 2. Status filter - shows only reviews with matching status
   * 3. Channel filter - shows only reviews from selected source
   */
  filteredReviews = computed(() => {
    let reviews = this.allReviews();

    // Apply search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      reviews = reviews.filter(review =>
        review.text.toLowerCase().includes(query) ||
        review.store.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    const status = this.selectedStatus();
    if (status !== 'all') {
      reviews = reviews.filter(review => review.status === status);
    }

    // Apply channel filter
    const channel = this.selectedChannel();
    if (channel !== 'all') {
      reviews = reviews.filter(review => review.source === channel);
    }

    return reviews;
  });

  // Statistics computed from filtered results
  totalReviews = computed(() => this.filteredReviews().length);
  pendingCount = computed(() =>
    this.filteredReviews().filter(r => r.status === 'pending').length
  );

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  /**
   * Load all reviews from the API
   *
   * Purpose: Fetch review data on component initialization
   * Sets loading state and populates the reviews signal
   */
  private loadReviews(): void {
    this.isLoading.set(true);
    this.reviewService.getReviews().subscribe({
      next: (reviews) => {
        this.allReviews.set(reviews);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Toggle Review Expansion
   *
   * Purpose: Expand or collapse a review row to show full details and reply interface
   *
   * How the expansion panel works:
   * 1. When user clicks a row, we check if it's already expanded
   * 2. If clicking the same row: collapse it (set to null)
   * 3. If clicking a different row: expand the new one (set to its ID)
   * 4. The template uses *ngIf to conditionally render the expanded section
   *
   * @param reviewId - The ID of the review to toggle
   *
   * Why this pattern:
   * - Simple state management with a single variable
   * - Only one review expanded at a time (better UX for focused interaction)
   * - Collapsing resets the reply form automatically
   */
  toggleExpansion(reviewId: string): void {
    if (this.expandedReviewId() === reviewId) {
      // Already expanded - collapse it
      this.expandedReviewId.set(null);
      this.clearReplyForm();
    } else {
      // Expand this review (collapses any other expanded review)
      this.expandedReviewId.set(reviewId);
      this.clearReplyForm();
    }
  }

  /**
   * Check if a review is currently expanded
   *
   * @param reviewId - ID of the review to check
   * @returns boolean - True if this review is expanded
   *
   * Why separate method: Makes template logic cleaner and more readable
   */
  isExpanded(reviewId: string): boolean {
    return this.expandedReviewId() === reviewId;
  }

  /**
   * Submit Reply to Review
   *
   * Purpose: Send the reply message to the API and update UI
   *
   * Process:
   * 1. Validate that reply text is not empty
   * 2. Set loading state to disable form
   * 3. Call API via service
   * 4. On success: Show success message, update review status
   * 5. On error: Show error message
   * 6. Clear form after success
   *
   * @param reviewId - ID of the review being replied to
   */
  submitReply(reviewId: string): void {
    const text = this.replyText().trim();

    // Validation: Ensure reply text is not empty
    if (!text) {
      this.replyMessage.set('Please enter a reply message');
      return;
    }

    // Set loading state
    this.isSubmittingReply.set(true);
    this.replyMessage.set('');

    // Call the reply API
    this.reviewService.reply(reviewId, text).subscribe({
      next: (response) => {
        this.isSubmittingReply.set(false);

        if (response.success) {
          // Show success message
          this.replyMessage.set('Reply sent successfully!');

          // Update the review status to 'replied' in local state
          // This provides immediate feedback without refetching all data
          this.updateReviewStatus(reviewId, 'replied');

          // Clear form and collapse after 2 seconds
          setTimeout(() => {
            this.expandedReviewId.set(null);
            this.clearReplyForm();
          }, 2000);
        }
      },
      error: (error) => {
        this.isSubmittingReply.set(false);
        this.replyMessage.set('Failed to send reply. Please try again.');
        console.error('Reply error:', error);
      }
    });
  }

  /**
   * Update Review Status in Local State
   *
   * Purpose: Optimistically update the UI without refetching data
   *
   * @param reviewId - ID of the review to update
   * @param newStatus - The new status value
   */
  private updateReviewStatus(reviewId: string, newStatus: Review['status']): void {
    const reviews = this.allReviews();
    const updatedReviews = reviews.map(review =>
      review.id === reviewId ? { ...review, status: newStatus } : review
    );
    this.allReviews.set(updatedReviews);
  }

  /**
   * Clear Reply Form
   *
   * Purpose: Reset all reply-related form state
   */
  private clearReplyForm(): void {
    this.replyText.set('');
    this.replyMessage.set('');
  }

  /**
   * Get appropriate icon for each review source/channel
   *
   * @param source - The review source (swiggy, zomato, instore)
   * @returns string - Emoji icon for the source
   */
  getChannelIcon(source: string): string {
    const icons: Record<string, string> = {
      swiggy: '🍔',
      zomato: '🍕',
      instore: '🏪'
    };
    return icons[source] || '💬';
  }

  /**
   * Get status badge color classes
   *
   * @param status - The review status
   * @returns string - Tailwind classes for badge styling
   */
  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      replied: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get sentiment badge color classes
   *
   * @param sentiment - The review sentiment
   * @returns string - Tailwind classes for sentiment indicator
   */
  getSentimentClass(sentiment: string): string {
    const classes: Record<string, string> = {
      positive: 'text-green-600',
      neutral: 'text-gray-600',
      negative: 'text-red-600'
    };
    return classes[sentiment] || 'text-gray-600';
  }

  /**
   * Generate star rating display
   *
   * @param rating - Numeric rating (1-5)
   * @returns string - Star emoji string
   */
  getStarRating(rating: number): string {
    const fullStars = '⭐'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return fullStars + emptyStars;
  }

  /**
   * Truncate review text for grid display
   *
   * @param text - Full review text
   * @param maxLength - Maximum characters to display
   * @returns string - Truncated text with ellipsis
   */
  truncateText(text: string, maxLength: number = 80): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
