import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div class="relative">
          <!-- Spinning gradient circle -->
          <div class="w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin"></div>

          <!-- Inner circle -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoadingSpinner {
  constructor(public loadingService: LoadingService) {}
}
