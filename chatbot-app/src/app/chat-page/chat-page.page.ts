import { Component, OnInit } from '@angular/core';
import { ChatServiceService } from '../services/chat-service.service';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.page.html',
  styleUrls: ['./chat-page.page.scss'],
  standalone: false
})
export class ChatPagePage implements OnInit {

  messages: { from: string; text: string }[] = [];
  input = '';

  constructor(private chat: ChatServiceService) {}

  ngOnInit() {
    this.chat.getBotMessages().subscribe((msg) => {
      this.messages.push({ from: 'bot', text: msg });
    });
  }

  send() {
    if (!this.input.trim()) return;
    this.messages.push({ from: 'user', text: this.input });
    this.chat.sendMessage(this.input);
    this.input = '';
  }
}
