import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../models/models';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl(''),
    gender: new FormControl('', [Validators.required]),
    agreedToTerms: new FormControl(false, [Validators.requiredTrue])
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      // Check if passwords match
      if (this.password?.value !== this.confirmPassword?.value) {
        this.confirmPassword?.setErrors({ mismatch: true });
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set('');

      const registerData: RegisterRequest = {
        firstName: this.firstName?.value || '',
        lastName: this.lastName?.value || '',
        email: this.email?.value || '',
        phoneNumber: this.phoneNumber?.value || undefined,
        password: this.password?.value || '',
        dateOfBirth: this.dateOfBirth?.value ? new Date(this.dateOfBirth.value) : undefined,
        gender: this.gender?.value || ''
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.toastService.success('Registration successful! Please login with your credentials.');
          this.isLoading.set(false);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          const errorMsg = error.error?.message || 'Registration failed. Please try again.';
          this.errorMessage.set(errorMsg);
          this.toastService.error(errorMsg);
          this.isLoading.set(false);
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phoneNumber() {
    return this.registerForm.get('phoneNumber');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get dateOfBirth() {
    return this.registerForm.get('dateOfBirth');
  }

  get gender() {
    return this.registerForm.get('gender');
  }

  get agreedToTerms() {
    return this.registerForm.get('agreedToTerms');
  }
}
