export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender: string;
  profileImageUrl?: string;
  bio?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface WardrobeItem {
  id: number;
  name: string;
  category: 'Top' | 'Bottom' | 'Shoes' | 'Outer' | 'Accessories' | 'Bag' | 'Hat';
  subCategory?: string;
  brand?: string;
  size?: string;
  primaryColor: string;
  secondaryColor?: string;
  pattern?: string;
  cloudinaryUrl: string;
  thumbnailUrl?: string;
  material?: string;
  season?: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  occasion?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  condition?: string;
  isFavorite: boolean;
  tags?: string;
  notes?: string;
  wornCount: number;
  lastWornAt?: Date;
  createdAt: Date;
}

export interface Outfit {
  id: number;
  userId: number;
  name: string;
  description?: string;
  topId?: number;
  bottomId?: number;
  shoesId?: number;
  outerId?: number;
  accessoryId?: number;
  bagId?: number;
  hatId?: number;
  mood?: string;
  event?: string;
  weather?: string;
  season?: string;
  rating?: number;
  isFavorite: boolean;
  wornCount: number;
  lastWornAt?: Date;
  tags?: string;
  notes?: string;
  createdAt: Date;
}

export interface OutfitHistory {
  id: number;
  outfitId: number;
  userId: number;
  wornDate: Date;
  event?: string;
  location?: string;
  rating?: number;
  notes?: string;
  photoUrl?: string;
  weather?: string;
  temperature?: string;
  createdAt: Date;
}

export interface UserPreferences {
  id: number;
  userId: number;
  favoriteColors?: string; // JSON array
  avoidColors?: string; // JSON array
  preferredStyles?: string; // JSON array
  fashionGoal?: string;
  shoeSize?: number;
  height?: string;
  weight?: string;
  bodyType?: string;
  skinTone?: string;
  hairColor?: string;
  preferredBrands?: string; // JSON array
  minBudget?: number;
  maxBudget?: number;
  occupation?: string;
  lifestyle?: string;
  frequentOccasions?: string; // JSON array
  climateZone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  dateOfBirth?: Date;
  gender: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
