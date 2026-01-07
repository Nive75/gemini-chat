import { Component, signal, computed, inject, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageList } from '../message-list/message-list';
import { MessageInput } from '../message-input/message-input';
import { Message } from '../../models/message.model';
import { Gemini } from '../../services/gemini';
import { Loading } from '../../services/loading';
import { Storage } from '../../services/storage';

@Component({
  selector: 'app-chat-container',
  imports: [MessageList, MessageInput, DatePipe],
  templateUrl: './chat-container.html',
  styleUrl: './chat-container.css',
})
export class ChatContainer {
  private geminiService = inject(Gemini);
  private loadingService = inject(Loading);
  protected storageService = inject(Storage);
  
  messages = signal<Message[]>([]);
  error = signal<string | null>(null);
  messageCount = computed(() => this.messages().length);
  isLoading = computed(() => this.loadingService.isLoading());
  conversations = computed(() => this.storageService.conversations());
  showHistory = signal<boolean>(false);

  constructor() {
    effect(() => {
      const currentId = this.storageService.currentConversationId();
      if (currentId) {
        const conversation = this.storageService.getConversation(currentId);
        if (conversation) {
          this.messages.set(conversation.messages);
        }
      }
    });

    effect(() => {
      const msgs = this.messages();
      const currentId = this.storageService.currentConversationId();
      
      if (msgs.length > 0) {
        if (currentId) {
          this.storageService.updateConversation(currentId, msgs);
        } else {
          const conversation = this.storageService.createConversation(msgs);
          this.storageService.saveCurrentConversation(conversation.id);
        }
      }
    });
  }

  onSendMessage(text: string): void {
    this.error.set(null);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      role: 'user',
      timestamp: new Date()
    };
    this.messages.update(messages => [...messages, userMessage]);
    
    this.loadingService.start();
    
    this.geminiService.sendMessage(text).subscribe({
      next: (responseText) => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          role: 'assistant',
          timestamp: new Date()
        };
        this.messages.update(messages => [...messages, assistantMessage]);
        this.loadingService.stop();
      },
      error: (error) => {
        this.error.set(error.message || 'Une erreur est survenue lors de l\'envoi du message.');
        this.loadingService.stop();
      }
    });
  }

  newChat(): void {
    this.messages.set([]);
    this.error.set(null);
    this.storageService.newChat();
  }

  loadConversation(id: string): void {
    const conversation = this.storageService.getConversation(id);
    if (conversation) {
      this.messages.set(conversation.messages);
      this.storageService.saveCurrentConversation(id);
      this.showHistory.set(false);
    }
  }

  deleteConversation(id: string, event: Event): void {
    event.stopPropagation();
    this.storageService.deleteConversation(id);
    if (this.storageService.currentConversationId() === id) {
      this.newChat();
    }
  }

  toggleHistory(): void {
    this.showHistory.update(show => !show);
  }
}