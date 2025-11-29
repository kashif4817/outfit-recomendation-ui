import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WardrobeService } from '../services/wardrobe.service';
import { WardrobeItem } from '../models/models';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-wardrobe',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './wardrobe.html',
  styleUrl: './wardrobe.css',
})
export class Wardrobe {
  selectedCategory = signal<string>('All');
  isUploading = signal(false);
  isLoading = signal(false);
  allWardrobeItems = signal<WardrobeItem[]>([]); // Store all items for client-side filtering
  wardrobeItems = signal<WardrobeItem[]>([]);
  showUploadModal = signal(false);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  errorMessage = signal('');

  categories = ['All', 'Top', 'Bottom', 'Shoes', 'Outer', 'Accessories', 'Bag', 'Hat'];

  uploadForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    category: new FormControl('Top', [Validators.required]),
    primaryColor: new FormControl('', [Validators.required]),
    subCategory: new FormControl(''),
    brand: new FormControl(''),
    size: new FormControl(''),
    secondaryColor: new FormControl(''),
    pattern: new FormControl(''),
    material: new FormControl(''),
    season: new FormControl('All-Season'),
    occasion: new FormControl(''),
    purchasePrice: new FormControl<number | null>(null),
    condition: new FormControl('Excellent'),
    tags: new FormControl(''),
    notes: new FormControl('')
  });

  constructor(
    private router: Router,
    private wardrobeService: WardrobeService,
    private toastService: ToastService
  ) {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Only fetch from API if we don't have items yet
    this.wardrobeService.getAll().subscribe({
      next: (items) => {
        this.allWardrobeItems.set(items);
        this.applyClientSideFilter();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading wardrobe items:', error);
        this.errorMessage.set('Failed to load wardrobe items');
        this.toastService.error('Failed to load wardrobe items');
        this.isLoading.set(false);
      }
    });
  }

  applyClientSideFilter(): void {
    const category = this.selectedCategory();
    if (category === 'All') {
      this.wardrobeItems.set(this.allWardrobeItems());
    } else {
      this.wardrobeItems.set(
        this.allWardrobeItems().filter(item => item.category === category)
      );
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  uploadItem(): void {
    if (this.uploadForm.valid && this.selectedFile()) {
      this.isUploading.set(true);
      this.errorMessage.set('');

      const formData = new FormData();
      formData.append('file', this.selectedFile()!);
      formData.append('name', this.uploadForm.value.name || '');
      formData.append('category', this.uploadForm.value.category || 'Top');
      formData.append('primaryColor', this.uploadForm.value.primaryColor || '');

      if (this.uploadForm.value.subCategory) formData.append('subCategory', this.uploadForm.value.subCategory);
      if (this.uploadForm.value.brand) formData.append('brand', this.uploadForm.value.brand);
      if (this.uploadForm.value.size) formData.append('size', this.uploadForm.value.size);
      if (this.uploadForm.value.secondaryColor) formData.append('secondaryColor', this.uploadForm.value.secondaryColor);
      if (this.uploadForm.value.pattern) formData.append('pattern', this.uploadForm.value.pattern);
      if (this.uploadForm.value.material) formData.append('material', this.uploadForm.value.material);
      if (this.uploadForm.value.season) formData.append('season', this.uploadForm.value.season);
      if (this.uploadForm.value.occasion) formData.append('occasion', this.uploadForm.value.occasion);
      if (this.uploadForm.value.purchasePrice) formData.append('purchasePrice', this.uploadForm.value.purchasePrice.toString());
      if (this.uploadForm.value.condition) formData.append('condition', this.uploadForm.value.condition);
      if (this.uploadForm.value.tags) formData.append('tags', this.uploadForm.value.tags);
      if (this.uploadForm.value.notes) formData.append('notes', this.uploadForm.value.notes);

      this.wardrobeService.uploadItem(formData).subscribe({
        next: (item) => {
          console.log('Item uploaded successfully:', item);
          // Add new item to the list without reloading
          this.allWardrobeItems.set([...this.allWardrobeItems(), item]);
          this.applyClientSideFilter();

          this.toastService.success('Item uploaded successfully!');
          this.isUploading.set(false);
          this.showUploadModal.set(false);
          this.uploadForm.reset({
            category: 'Top',
            season: 'All-Season',
            condition: 'Excellent'
          });
          this.selectedFile.set(null);
          this.imagePreview.set(null);
        },
        error: (error) => {
          console.error('Upload failed:', error);
          const errorMsg = error.error?.message || 'Upload failed. Please try again.';
          this.errorMessage.set(errorMsg);
          this.toastService.error(errorMsg);
          this.isUploading.set(false);
        }
      });
    }
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
    // Use client-side filtering instead of API call
    this.applyClientSideFilter();
  }

  get filteredItems() {
    return this.wardrobeItems();
  }

  toggleFavorite(id: number): void {
    this.wardrobeService.toggleFavorite(id).subscribe({
      next: () => {
        // Update locally without API call
        const allItems = this.allWardrobeItems();
        const updatedItems = allItems.map(item =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        );
        this.allWardrobeItems.set(updatedItems);
        this.applyClientSideFilter();

        const item = updatedItems.find(i => i.id === id);
        if (item?.isFavorite) {
          this.toastService.success('Added to favorites!');
        } else {
          this.toastService.info('Removed from favorites');
        }
      },
      error: (error) => {
        console.error('Failed to toggle favorite:', error);
        this.errorMessage.set('Failed to toggle favorite');
        this.toastService.error('Failed to toggle favorite');
      }
    });
  }

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.wardrobeService.deleteItem(id).subscribe({
        next: () => {
          // Remove from local state without reloading
          this.allWardrobeItems.set(this.allWardrobeItems().filter(item => item.id !== id));
          this.applyClientSideFilter();
          this.toastService.success('Item deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete item:', error);
          this.errorMessage.set('Failed to delete item');
          this.toastService.error('Failed to delete item');
        }
      });
    }
  }

  openUploadModal(): void {
    this.showUploadModal.set(true);
    this.errorMessage.set('');
  }

  closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.uploadForm.reset({
      category: 'Top',
      season: 'All-Season',
      condition: 'Excellent'
    });
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.errorMessage.set('');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
