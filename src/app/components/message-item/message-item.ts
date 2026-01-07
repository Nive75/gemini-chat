import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-item',
  imports: [DatePipe],
  templateUrl: './message-item.html',
  styleUrl: './message-item.css',
})
export class MessageItem {
  message = input.required<Message>();
}
