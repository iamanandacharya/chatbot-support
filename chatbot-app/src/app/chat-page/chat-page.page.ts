import { Component, OnInit } from '@angular/core';
import { ChatServiceService } from '../services/chat-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.page.html',
  styleUrls: ['./chat-page.page.scss'],
  standalone: false
})
export class ChatPagePage implements OnInit {

  messages: { from: string; text: string; timestamp: any }[] = [];
  message = '';
  isTyping = false;

  constructor(private chatService: ChatServiceService, private http: HttpClient) {}

  // On init, get token and start chat connection
  async ngOnInit() {
    const res: any = await this.http.post('http://localhost:3000/api/login', { username: 'testuser' }).toPromise();
    this.chatService.connect(res.token);

    // Subscribe to bot messages
    this.chatService.onBotMessage().subscribe((msg) => {
      this.messages.push({ from: 'bot', text: msg.text, timestamp: msg.timestamp });
    });

    // Subscribe to typing events
    this.chatService.onTyping().subscribe(() => {
      this.isTyping = true;
      setTimeout(() => (this.isTyping = false), 1000);
    });
  }

  // Send user message to chat
  send() {
    if (!this.message.trim()) return;
    this.messages.push({ from: 'user', text: this.message, timestamp: new Date() });
    this.chatService.sendMessage(this.message);
    this.message = '';
  }
}
