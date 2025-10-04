import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = "http://13.59.44.96:8083/api"

  constructor(private http: HttpClient) { }
  
  getProgressiveCounts(
    filterSteps: any
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/companies/financial-screening/progressive-counts`,
      filterSteps
    );
  }
}
