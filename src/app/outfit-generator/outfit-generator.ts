import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OutfitService, GenerateOutfitRequest, SaveOutfitRequest } from '../services/outfit.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-outfit-generator',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './outfit-generator.html',
  styleUrl: './outfit-generator.css',
})
export class OutfitGenerator {
  isGenerating = signal(false);
  isSaving = signal(false);
  generatedOutfit = signal<any>(null);
  errorMessage = signal('');
  successMessage = signal('');

  outfitForm = new FormGroup({
    mood: new FormControl('', [Validators.required]),
    event: new FormControl('', [Validators.required]),
    weather: new FormControl('Sunny', [Validators.required])
  });

  saveForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    rating: new FormControl<number | null>(null)
  });

  moods = [
    { value: 'Casual', icon: '😊', color: 'from-blue-500 to-cyan-500' },
    { value: 'Formal', icon: '👔', color: 'from-purple-500 to-indigo-500' },
    { value: 'Sporty', icon: '⚽', color: 'from-green-500 to-emerald-500' },
    { value: 'Party', icon: '🎉', color: 'from-pink-500 to-rose-500' },
    { value: 'Professional', icon: '💼', color: 'from-gray-600 to-gray-800' },
    { value: 'Relaxed', icon: '🏖️', color: 'from-yellow-500 to-orange-500' }
  ];

  events = [
    'Work Meeting',
    'Date Night',
    'Gym Session',
    'Wedding',
    'Casual Outing',
    'Business Event',
    'Birthday Party',
    'Concert',
    'Beach Day'
  ];

  weatherOptions = ['Sunny', 'Rainy', 'Cold', 'Hot'];

  constructor(
    private router: Router,
    private outfitService: OutfitService,
    private toastService: ToastService
  ) {}

  generateOutfit(): void {
    if (this.outfitForm.valid) {
      this.isGenerating.set(true);
      this.errorMessage.set('');

      const request: GenerateOutfitRequest = {
        mood: this.outfitForm.value.mood || undefined,
        event: this.outfitForm.value.event || undefined,
        weather: this.outfitForm.value.weather || undefined
      };

      this.outfitService.generate(request).subscribe({
        next: (outfit) => {
          console.log('Generated outfit:', outfit);
          this.generatedOutfit.set(outfit);
          this.toastService.success('Outfit generated successfully!');
          this.isGenerating.set(false);
        },
        error: (error) => {
          console.error('Failed to generate outfit:', error);
          const errorMsg = error.error?.message || 'Failed to generate outfit. Make sure you have items in your wardrobe.';
          this.errorMessage.set(errorMsg);
          this.toastService.error(errorMsg);
          this.isGenerating.set(false);
        }
      });
    }
  }

  saveOutfit(): void {
    if (this.saveForm.valid && this.generatedOutfit()) {
      this.isSaving.set(true);
      this.errorMessage.set('');

      const outfit = this.generatedOutfit();
      const saveRequest: SaveOutfitRequest = {
        name: this.saveForm.value.name || '',
        description: this.saveForm.value.description || undefined,
        topId: outfit.top?.id,
        bottomId: outfit.bottom?.id,
        shoesId: outfit.shoes?.id,
        outerId: outfit.outer?.id,
        accessoryId: outfit.accessory?.id,
        bagId: outfit.bag?.id,
        hatId: outfit.hat?.id,
        mood: this.outfitForm.value.mood || undefined,
        event: this.outfitForm.value.event || undefined,
        weather: this.outfitForm.value.weather || undefined,
        rating: this.saveForm.value.rating || undefined
      };

      this.outfitService.save(saveRequest).subscribe({
        next: (saved) => {
          console.log('Outfit saved successfully:', saved);
          this.successMessage.set('Outfit saved successfully!');
          this.toastService.success('Outfit saved successfully!');
          this.isSaving.set(false);
          this.saveForm.reset();

          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Failed to save outfit:', error);
          const errorMsg = error.error?.message || 'Failed to save outfit';
          this.errorMessage.set(errorMsg);
          this.toastService.error(errorMsg);
          this.isSaving.set(false);
        }
      });
    }
  }

  regenerate(): void {
    this.generatedOutfit.set(null);
    this.successMessage.set('');
    this.generateOutfit();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
