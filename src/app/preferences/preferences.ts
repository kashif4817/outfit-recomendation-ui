import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PreferencesService, SavePreferencesRequest } from '../services/preferences.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-preferences',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.css',
})
export class Preferences {
  isSaving = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  hasExistingPreferences = signal(false);

  preferencesForm = new FormGroup({
    favoriteColors: new FormControl(''),
    avoidColors: new FormControl(''),
    preferredStyles: new FormControl(''),
    fashionGoal: new FormControl(''),
    shoeSize: new FormControl<number | null>(null),
    height: new FormControl(''),
    weight: new FormControl(''),
    bodyType: new FormControl(''),
    skinTone: new FormControl(''),
    hairColor: new FormControl(''),
    preferredBrands: new FormControl(''),
    minBudget: new FormControl<number | null>(null),
    maxBudget: new FormControl<number | null>(null),
    occupation: new FormControl(''),
    lifestyle: new FormControl(''),
    frequentOccasions: new FormControl(''),
    climateZone: new FormControl('')
  });

  colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Purple', 'Pink', 'Orange', 'Brown', 'Navy', 'Grey'];

  styles = [
    { name: 'Casual', icon: '👕' },
    { name: 'Formal', icon: '🎩' },
    { name: 'Sporty', icon: '⚽' },
    { name: 'Bohemian', icon: '🌸' },
    { name: 'Streetwear', icon: '🛹' },
    { name: 'Minimalist', icon: '⚪' },
    { name: 'Classic', icon: '🎯' },
    { name: 'Elegant', icon: '💎' }
  ];

  bodyTypes = ['Slim', 'Athletic', 'Average', 'Heavy', 'Hourglass', 'Pear', 'Apple', 'Rectangle'];

  climates = ['Tropical', 'Temperate', 'Cold', 'Desert', 'Mediterranean'];

  lifestyles = ['Active', 'Corporate', 'Creative', 'Casual', 'Student', 'Professional'];

  constructor(
    private router: Router,
    private preferencesService: PreferencesService,
    private toastService: ToastService
  ) {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.isLoading.set(true);

    this.preferencesService.get().subscribe({
      next: (prefs) => {
        console.log('Loaded preferences:', prefs);
        this.hasExistingPreferences.set(true);

        // Parse JSON arrays if they exist
        this.preferencesForm.patchValue({
          favoriteColors: prefs.favoriteColors || '',
          avoidColors: prefs.avoidColors || '',
          preferredStyles: prefs.preferredStyles || '',
          fashionGoal: prefs.fashionGoal || '',
          shoeSize: prefs.shoeSize || null,
          height: prefs.height || '',
          weight: prefs.weight || '',
          bodyType: prefs.bodyType || '',
          skinTone: prefs.skinTone || '',
          hairColor: prefs.hairColor || '',
          preferredBrands: prefs.preferredBrands || '',
          minBudget: prefs.minBudget || null,
          maxBudget: prefs.maxBudget || null,
          occupation: prefs.occupation || '',
          lifestyle: prefs.lifestyle || '',
          frequentOccasions: prefs.frequentOccasions || '',
          climateZone: prefs.climateZone || ''
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading preferences:', error);
        // If 404, user doesn't have preferences yet - that's ok
        if (error.status !== 404) {
          this.errorMessage.set('Failed to load preferences');
          this.toastService.error('Failed to load preferences');
        }
        this.isLoading.set(false);
      }
    });
  }

  savePreferences(): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: SavePreferencesRequest = {
      favoriteColors: this.preferencesForm.value.favoriteColors || undefined,
      avoidColors: this.preferencesForm.value.avoidColors || undefined,
      preferredStyles: this.preferencesForm.value.preferredStyles || undefined,
      fashionGoal: this.preferencesForm.value.fashionGoal || undefined,
      shoeSize: this.preferencesForm.value.shoeSize || undefined,
      height: this.preferencesForm.value.height || undefined,
      weight: this.preferencesForm.value.weight || undefined,
      bodyType: this.preferencesForm.value.bodyType || undefined,
      skinTone: this.preferencesForm.value.skinTone || undefined,
      hairColor: this.preferencesForm.value.hairColor || undefined,
      preferredBrands: this.preferencesForm.value.preferredBrands || undefined,
      minBudget: this.preferencesForm.value.minBudget || undefined,
      maxBudget: this.preferencesForm.value.maxBudget || undefined,
      occupation: this.preferencesForm.value.occupation || undefined,
      lifestyle: this.preferencesForm.value.lifestyle || undefined,
      frequentOccasions: this.preferencesForm.value.frequentOccasions || undefined,
      climateZone: this.preferencesForm.value.climateZone || undefined
    };

    const saveObservable = this.hasExistingPreferences()
      ? this.preferencesService.update(request)
      : this.preferencesService.save(request);

    saveObservable.subscribe({
      next: (saved) => {
        console.log('Preferences saved:', saved);
        this.successMessage.set('Preferences saved successfully!');
        this.toastService.success('Preferences saved successfully!');
        this.hasExistingPreferences.set(true);
        this.isSaving.set(false);

        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Failed to save preferences:', error);
        const errorMsg = error.error?.message || 'Failed to save preferences';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
        this.isSaving.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
