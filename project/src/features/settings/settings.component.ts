import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AppSettings, AutoReplyRule } from '../../core/services/settings.service';

/**
 * Settings Component
 *
 * Purpose: Allows users to configure application preferences and auto-reply rules
 *
 * Key Features:
 * - Toggle Sentiment Analysis functionality
 * - Toggle Dark Mode preference
 * - Manage auto-reply message rules by sentiment type
 * - Save settings with visual feedback
 *
 * Why standalone: Modern Angular approach with explicit dependencies
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  // Toggle settings
  sentimentAnalysisEnabled = signal<boolean>(false);
  darkModeEnabled = signal<boolean>(false);

  // Auto-reply rules management
  autoReplyRules = signal<AutoReplyRule[]>([]);

  // Loading and feedback states
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  feedbackMessage = signal<string>('');
  feedbackType = signal<'success' | 'error'>('success');

  // Track if form has unsaved changes
  hasChanges = signal<boolean>(false);

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  /**
   * Load current settings from API
   *
   * Purpose: Fetch user's saved preferences on component init
   */
  private loadSettings(): void {
    this.isLoading.set(true);
    this.settingsService.getSettings().subscribe({
      next: (settings: AppSettings) => {
        this.sentimentAnalysisEnabled.set(settings.sentimentAnalysis);
        this.darkModeEnabled.set(settings.darkMode);
        this.autoReplyRules.set(settings.autoReplyRules);
        this.isLoading.set(false);
        this.hasChanges.set(false);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.isLoading.set(false);
        this.showFeedback('Failed to load settings', 'error');
      }
    });
  }

  /**
   * Handle sentiment analysis toggle
   *
   * Purpose: Update toggle state and mark form as changed
   */
  toggleSentimentAnalysis(): void {
    this.sentimentAnalysisEnabled.set(!this.sentimentAnalysisEnabled());
    this.hasChanges.set(true);
  }

  /**
   * Handle dark mode toggle
   *
   * Purpose: Update toggle state and mark form as changed
   */
  toggleDarkMode(): void {
    this.darkModeEnabled.set(!this.darkModeEnabled());
    this.hasChanges.set(true);
  }

  /**
   * Update auto-reply rule message
   *
   * Purpose: Modify rule text and track changes
   *
   * @param ruleId - ID of rule to update
   * @param newMessage - Updated message text
   */
  updateRuleMessage(ruleId: string, newMessage: string): void {
    const rules = this.autoReplyRules();
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      rule.message = newMessage;
      this.autoReplyRules.set([...rules]);
      this.hasChanges.set(true);
    }
  }

  /**
   * Save all settings changes
   *
   * Purpose: Send updated configuration to API and persist changes
   *
   * Process:
   * 1. Validate form data
   * 2. Set loading state
   * 3. Call API to save settings
   * 4. Show success/error feedback
   * 5. Reset change tracking on success
   */
  saveSettings(): void {
    // Validate that auto-reply rules are not empty
    const rules = this.autoReplyRules();
    if (rules.length === 0) {
      this.showFeedback('At least one auto-reply rule is required', 'error');
      return;
    }

    // Check if all rules have messages
    if (rules.some(r => !r.message || r.message.trim() === '')) {
      this.showFeedback('All auto-reply rules must have a message', 'error');
      return;
    }

    this.isSaving.set(true);
    this.clearFeedback();

    const settings: AppSettings = {
      sentimentAnalysis: this.sentimentAnalysisEnabled(),
      darkMode: this.darkModeEnabled(),
      autoReplyRules: rules
    };

    this.settingsService.saveSettings(settings).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.hasChanges.set(false);
        this.showFeedback('Settings saved successfully', 'success');
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.isSaving.set(false);
        this.showFeedback('Failed to save settings. Please try again.', 'error');
      }
    });
  }

  /**
   * Reset form to last saved state
   *
   * Purpose: Discard unsaved changes and reload settings
   */
  resetChanges(): void {
    this.loadSettings();
    this.showFeedback('Changes discarded', 'success');
  }

  /**
   * Get trigger label for display
   *
   * @param trigger - Sentiment type
   * @returns string - Formatted label
   */
  getTriggerLabel(trigger: string): string {
    const labels: Record<string, string> = {
      positive: 'Positive Feedback',
      negative: 'Negative Feedback',
      neutral: 'Neutral Feedback'
    };
    return labels[trigger] || trigger;
  }

  /**
   * Get trigger badge color
   *
   * @param trigger - Sentiment type
   * @returns string - Tailwind classes
   */
  getTriggerBadgeClass(trigger: string): string {
    const classes: Record<string, string> = {
      positive: 'bg-green-100 text-green-800',
      negative: 'bg-red-100 text-red-800',
      neutral: 'bg-blue-100 text-blue-800'
    };
    return classes[trigger] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Show feedback message to user
   *
   * @param message - Message text
   * @param type - Message type (success or error)
   */
  private showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);

    // Auto-hide message after 5 seconds
    setTimeout(() => {
      this.clearFeedback();
    }, 5000);
  }

  /**
   * Clear feedback message
   */
  private clearFeedback(): void {
    this.feedbackMessage.set('');
  }
}
