import { Component, signal } from '@angular/core';
import { ChatContainer } from './components/chat-container/chat-container';

@Component({
  selector: 'app-root',
  imports: [ChatContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gemini-chat');
}
