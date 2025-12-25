import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  postPdfImagesData(formData: FormData, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    });

    return this.http.post(`${this.url}/pdfapi/convert/`, formData, { headers });
  }

  postLabelledImageData(payload: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<any>(`${this.url}/img2yololabels/generate-yolo-label/`, payload, { headers });
  }

  generateExcelSheet(payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<any>(`${this.url}/excelsheetapi/excelsheet/`, payload, { headers });
  }

  changePasswordByUser(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.url}/user/user-change-password/`, data, { headers });
  }

  forgotPasswordByUser(data: any): Observable<any> {
    return this.http.post(`${this.url}/user/user-change-password/`, data);
  }

  changePasswordByAdmin(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.url}/user/admin-change-password/`, data, { headers });
  }

  sendMail(data: any): Observable<any> {
    return this.http.post<any>(`${this.url}/user/send-otp/`, data);
  }

  verifyOTP(data: any): Observable<any> {
    return this.http.post<any>(`${this.url}/user/verify-otp/`, data);
  }

  addUsers(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.url}/user/user-register/`, data, { headers });
  }

  addAdmin(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.url}/user/admin-register/`, data, { headers });
  }

  allUsers(token: string) {
    return this.http.get(`${this.url}/user/list-all-users`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
}