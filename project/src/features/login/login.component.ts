import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Login Component
 *
 * Purpose: Provides the user interface for authentication
 * Handles form validation, submission, and error display
 *
 * Why Standalone: Modern Angular approach - self-contained component with explicit imports
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Reactive form for login - provides validation and value management
  // Why FormGroup: Type-safe form handling with built-in validation
  loginForm: FormGroup;

  // Signals for reactive state management
  // Why signals: Automatic UI updates when state changes
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form with validators
    // Required validators ensure fields aren't empty
    // Email validator ensures proper email format
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Handle Login Form Submission
   *
   * Process:
   * 1. Validate form
   * 2. Show loading state
   * 3. Call auth service
   * 4. Navigate on success or show error
   *
   * Why async/await: Cleaner error handling vs. promise chains
   */
  onSubmit(): void {
    // Clear any previous error messages
    this.errorMessage.set('');

    // Prevent submission if form is invalid
    // This is a safety check - the submit button is disabled when invalid
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
      return;
    }

    // Extract form values
    const { email, password } = this.loginForm.value;

    // Set loading state to show spinner and disable form
    this.isLoading.set(true);

    // Call authentication service
    this.authService.login(email, password).subscribe({
      next: (response) => {
        // Login successful - navigate to dashboard
        // Why setTimeout: Ensures navigation happens after current digest cycle
        this.isLoading.set(false);
        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        // Login failed - show error message
        this.isLoading.set(false);

        // Extract error message from response or use default
        const message = error.error?.message || 'Login failed. Please try again.';
        this.errorMessage.set(message);
      }
    });
  }

  /**
   * Check if a form field has errors and has been touched
   *
   * @param fieldName - Name of the form field to check
   * @returns boolean - True if field should show error
   *
   * Why touched check: Only show errors after user has interacted with field
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get specific error message for a field
   *
   * @param fieldName - Name of the form field
   * @returns string - User-friendly error message
   *
   * Why: Provides clear feedback to users about what needs to be fixed
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }

    return '';
  }
}
