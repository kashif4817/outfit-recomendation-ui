import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Outfit } from '../models/models';

export interface GenerateOutfitRequest {
  mood?: string;
  event?: string;
  weather?: string;
}

export interface SaveOutfitRequest {
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
  isFavorite?: boolean;
  tags?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OutfitService {
  private apiUrl = 'http://localhost:5171/api/outfit';

  constructor(private http: HttpClient) {}

  generate(preferences: GenerateOutfitRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, preferences);
  }

  save(outfit: SaveOutfitRequest): Observable<Outfit> {
    return this.http.post<Outfit>(`${this.apiUrl}/save`, outfit);
  }

  getAll(): Observable<Outfit[]> {
    return this.http.get<Outfit[]>(this.apiUrl);
  }

  getById(id: number): Observable<Outfit> {
    return this.http.get<Outfit>(`${this.apiUrl}/${id}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleFavorite(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/favorite`, {});
  }
}
