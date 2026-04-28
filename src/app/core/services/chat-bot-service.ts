import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../dto/api-response';

@Injectable({
  providedIn: 'root',
})
export class ChatBotService {
  private readonly API_URL = 'http://localhost:8080/api/v1/chat';

  private http = inject(HttpClient);

  sendMessage(sessionId: string, message: string): Observable<string> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/${sessionId}`, { "message": message }).pipe(
      map(response => response.data['reply']),
      catchError(error => {
        console.error('Error sending message:', error);
        return throwError(() => error);
      })
    )
  }
}
