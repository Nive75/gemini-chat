import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule],
  templateUrl: './message-input.html',
  styleUrl: './message-input.css',
})
export class MessageInput {
  messageText = signal<string>('');
  sendMessage = output<string>();

  onSubmit(): void {
    const text = this.messageText().trim();
    if (text) {
      this.sendMessage.emit(text);
      this.messageText.set('');
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
