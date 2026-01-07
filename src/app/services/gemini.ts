import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GeminiResponse } from '../models/gemini-response.model';

@Injectable({
  providedIn: 'root'
})
export class Gemini {
  private http = inject(HttpClient);
  private apiUrl = environment.geminiApiUrl;
  private apiKey = environment.geminiApiKey;
  
  sendMessage(prompt: string): Observable<string> {
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    
    const body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    return this.http.post<GeminiResponse>(url, body).pipe(
      map(response => {
        if (response.candidates && response.candidates.length > 0) {
          const text = response.candidates[0].content.parts[0].text;
          return text;
        }
        throw new Error('No response from Gemini API');
      }),
      catchError(error => {
        console.error('Error calling Gemini API:', error);
        return throwError(() => new Error('Failed to get response from Gemini API. Please try again.'));
      })
    );
  }
}
