import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // Your local backend
  }

  sendMessage(message: string) {
    this.socket.emit('userMessage', message);
  }

  getBotMessages(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('botMessage', (msg: string) => {
        observer.next(msg);
      });
    });
  }
}
