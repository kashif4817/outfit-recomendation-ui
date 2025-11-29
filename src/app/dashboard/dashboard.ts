import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  quickActions = [
    {
      title: 'Upload Clothes',
      description: 'Add new items to your wardrobe',
      icon: 'upload',
      route: '/wardrobe',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Generate Outfit',
      description: 'Create a perfect outfit for any occasion',
      icon: 'sparkles',
      route: '/outfit-generator',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'View Wardrobe',
      description: 'Browse all your clothing items',
      icon: 'wardrobe',
      route: '/wardrobe',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Preferences',
      description: 'Update your style preferences',
      icon: 'settings',
      route: '/preferences',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  constructor(private router: Router, public authService: AuthService) {}

  get userName(): string {
    return this.authService.currentUser()?.fullName || 'User';
  }

  logout(): void {
    this.authService.logout();
  }
}
