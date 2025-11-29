import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5171/api'; // .NET backend URL
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuth();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const loginData: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(tap((response: AuthResponse) => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.isAuthenticated.set(true);
        this.currentUser.set(response.user);
      }));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(tap((response: AuthResponse) => {
        // Optionally auto-login after registration
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.isAuthenticated.set(true);
        this.currentUser.set(response.user);
      }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  checkAuth(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(this.userKey);

    if (token && userJson) {
      this.isAuthenticated.set(true);
      this.currentUser.set(JSON.parse(userJson));
    } else {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
    }
  }
}
