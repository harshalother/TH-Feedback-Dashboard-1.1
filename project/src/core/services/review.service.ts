import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Review Data Models
 *
 * Purpose: Type definitions for review data structure
 */
export interface Review {
  id: string;
  date: string;
  source: 'swiggy' | 'zomato' | 'instore';
  store: string;
  rating: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'pending' | 'replied' | 'resolved';
}

export interface ReplyRequest {
  reviewId: string;
  replyText: string;
}

export interface ReplyResponse {
  success: boolean;
  message: string;
}

/**
 * Review Service
 *
 * Purpose: Manages all review-related API operations
 * Handles fetching reviews and submitting replies
 *
 * Why Injectable: Allows dependency injection throughout the app
 * Why providedIn 'root': Singleton service shared across components
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  /**
   * Fetch all reviews
   *
   * @returns Observable<Review[]> - Stream of review data
   *
   * Why Observable: Allows components to subscribe and automatically handle async data
   * The mock interceptor catches this request and returns realistic data
   */
  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  /**
   * Submit a reply to a review
   *
   * @param reviewId - ID of the review being replied to
   * @param replyText - The reply message text
   * @returns Observable<ReplyResponse> - API response confirming the reply
   *
   * Why POST: Submitting new data to the server
   * In production, this would actually send the reply to the customer
   */
  reply(reviewId: string, replyText: string): Observable<ReplyResponse> {
    return this.http.post<ReplyResponse>(`${this.apiUrl}/reply`, {
      reviewId,
      replyText
    });
  }
}
