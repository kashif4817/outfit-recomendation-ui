import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WardrobeItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class WardrobeService {
  private apiUrl = 'http://localhost:5171/api/wardrobe';

  constructor(private http: HttpClient) {}

  uploadItem(formData: FormData): Observable<WardrobeItem> {
    return this.http.post<WardrobeItem>(`${this.apiUrl}/upload`, formData);
  }

  getAll(category?: string, season?: string, isFavorite?: boolean): Observable<WardrobeItem[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (season) params = params.set('season', season);
    if (isFavorite !== undefined) params = params.set('isFavorite', isFavorite.toString());

    return this.http.get<WardrobeItem[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<WardrobeItem> {
    return this.http.get<WardrobeItem>(`${this.apiUrl}/${id}`);
  }

  getByCategory(category: string): Observable<WardrobeItem[]> {
    return this.http.get<WardrobeItem[]>(`${this.apiUrl}/category/${category}`);
  }

  updateItem(id: number, formData: FormData): Observable<WardrobeItem> {
    return this.http.put<WardrobeItem>(`${this.apiUrl}/${id}`, formData);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleFavorite(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/favorite`, {});
  }
}
