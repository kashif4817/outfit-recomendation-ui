import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[10000] space-y-3 max-w-md">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast-item flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-lg border transition-all duration-300 ease-out transform animate-slide-in"
          [ngClass]="{
            'bg-gradient-to-r from-green-500/90 to-emerald-600/90 border-green-400/30': toast.type === 'success',
            'bg-gradient-to-r from-red-500/90 to-rose-600/90 border-red-400/30': toast.type === 'error',
            'bg-gradient-to-r from-yellow-500/90 to-amber-600/90 border-yellow-400/30': toast.type === 'warning',
            'bg-gradient-to-r from-blue-500/90 to-indigo-600/90 border-blue-400/30': toast.type === 'info'
          }"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            @switch (toast.type) {
              @case ('success') {
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              }
              @case ('error') {
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              }
              @case ('warning') {
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              }
              @case ('info') {
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
            }
          </div>

          <!-- Message -->
          <div class="flex-1 text-white font-medium text-sm leading-relaxed">
            {{ toast.message }}
          </div>

          <!-- Close Button -->
          <button
            (click)="toastService.remove(toast.id)"
            class="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200"
            aria-label="Close toast"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }

    .toast-item {
      min-width: 320px;
      max-width: 28rem;
    }

    @media (max-width: 640px) {
      .toast-item {
        min-width: 280px;
      }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
