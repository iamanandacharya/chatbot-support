import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  private socket: Socket;

  private readonly baseUrl = 'http://localhost:3000';

  constructor() {
    this.socket = io('http://localhost:3000'); // Your local backend
  }

  // Connect to backend with JWT token
   connect(token: string) {
    this.socket = io(this.baseUrl, {
      auth: { token },
    });
  }

  // Send user message to server
  sendMessage(message: string) {
    this.socket.emit('userMessage', message);
  }

  // Listen for bot responses
  onBotMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('botMessage', (msg) => observer.next(msg));
    });
  }

  // Listen for typing event from server
  onTyping(): Observable<boolean> {
    return new Observable((observer) => {
      this.socket.on('typing', () => observer.next(true));
    });
  }
}
