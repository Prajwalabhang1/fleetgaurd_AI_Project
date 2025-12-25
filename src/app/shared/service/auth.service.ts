import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private refreshTimeout: any;
  private url = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) { }

  // Admin login API
  adminLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.url}/user/admin-login/`, { email, password });
  }

  // User login API
  userLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.url}/user/user-login/`, { email, password });
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }

  // Get user information
  getUserInfo(): Observable<any> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('JWT token is missing');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.url}/user/user/`, { headers });
  }

  // Get user role
  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access');
  }

  // Set access and refresh tokens
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access', accessToken);
    localStorage.setItem('refresh', refreshToken);
    this.startTokenRefreshTimer(); // Automatically start refresh timer
  }

  // Clear tokens
  clearTokens(): void {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  // Refresh tokens dynamically based on expiry
  refreshTokens(): void {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) {
      this.logout();
      return;
    }

    this.http.post(`${this.url}/user/refresh/`, { refresh: refreshToken }).subscribe({
      next: (response: any) => {
        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);
          this.toastr.success('Session refreshed successfully.', 'Success');
        } else {
          this.toastr.error('Invalid refresh token response. Please log in again.', 'Error');
          this.logout();
        }
      },
      error: (err) => {
        console.error('Token refresh error:', err);
        this.toastr.error('Session expired. Please log in again.', 'Error');
        this.logout();
      },
    });
  }

  // Start token refresh timer based on token expiry
  startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();

    const token = this.getAccessToken();
    if (!token) {
      console.error('No access token available to start the timer.');
      return;
    }

    const tokenExpiry = this.getTokenExpiryTime(token);
    if (!tokenExpiry) {
      console.error('Unable to determine token expiry time.');
      return;
    }

    const now = new Date().getTime();
    const timeToRefresh = tokenExpiry - now - 60000; // Refresh 1 minute before expiry

    if (timeToRefresh > 0) {
      this.refreshTimeout = setTimeout(() => this.refreshTokens(), timeToRefresh);
    } else {
      console.warn('Token is close to expiry or already expired. Refreshing immediately.');
      this.refreshTokens();
    }
  }

  // Stop the token refresh timer
  stopTokenRefreshTimer(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  // Extract token expiry time from JWT
  private getTokenExpiryTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to parse token payload:', error);
      return null;
    }
  }

  // Logout function
  logout(): void {
    this.clearTokens();
    this.stopTokenRefreshTimer();
    this.router.navigate(['/login']);
  }
}
