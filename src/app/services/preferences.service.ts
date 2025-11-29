import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserPreferences } from '../models/models';

export interface SavePreferencesRequest {
  favoriteColors?: string;
  avoidColors?: string;
  preferredStyles?: string;
  fashionGoal?: string;
  shoeSize?: number;
  height?: string;
  weight?: string;
  bodyType?: string;
  skinTone?: string;
  hairColor?: string;
  preferredBrands?: string;
  minBudget?: number;
  maxBudget?: number;
  occupation?: string;
  lifestyle?: string;
  frequentOccasions?: string;
  climateZone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private apiUrl = 'http://localhost:5171/api/preferences';

  constructor(private http: HttpClient) {}

  get(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(this.apiUrl);
  }

  save(preferences: SavePreferencesRequest): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(this.apiUrl, preferences);
  }

  update(preferences: SavePreferencesRequest): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(this.apiUrl, preferences);
  }
}
