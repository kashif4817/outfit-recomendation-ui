import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.Register)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'wardrobe',
    loadComponent: () => import('./wardrobe/wardrobe').then(m => m.Wardrobe),
    canActivate: [authGuard]
  },
  {
    path: 'outfit-generator',
    loadComponent: () => import('./outfit-generator/outfit-generator').then(m => m.OutfitGenerator),
    canActivate: [authGuard]
  },
  {
    path: 'preferences',
    loadComponent: () => import('./preferences/preferences').then(m => m.Preferences),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
