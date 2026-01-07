import { Component, input, viewChild, effect, ElementRef, AfterViewChecked } from '@angular/core';
import { MessageItem } from '../message-item/message-item';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-list',
  imports: [MessageItem],
  templateUrl: './message-list.html',
  styleUrl: './message-list.css',
})
export class MessageList implements AfterViewChecked {
  messages = input.required<Message[]>();
  messageListContainer = viewChild<ElementRef>('messageListContainer');
  private shouldScroll = false;

  constructor() {
    effect(() => {
      this.messages();
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    const container = this.messageListContainer()?.nativeElement;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }
}
