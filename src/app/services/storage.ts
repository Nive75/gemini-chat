import { Injectable, signal } from '@angular/core';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

const STORAGE_KEY = 'gemini-chat-conversations';
const CURRENT_CONVERSATION_KEY = 'gemini-chat-current';

@Injectable({
  providedIn: 'root',
})
export class Storage {
  conversations = signal<Conversation[]>([]);
  currentConversationId = signal<string | null>(null);

  constructor() {
    this.loadConversations();
    this.loadCurrentConversation();
  }

  loadConversations(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const conversations = JSON.parse(stored).map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        this.conversations.set(conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      this.conversations.set([]);
    }
  }

  saveConversations(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.conversations()));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  loadCurrentConversation(): void {
    const stored = localStorage.getItem(CURRENT_CONVERSATION_KEY);
    if (stored) {
      this.currentConversationId.set(stored);
    }
  }

  saveCurrentConversation(id: string | null): void {
    if (id) {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    }
    this.currentConversationId.set(id);
  }

  createConversation(messages: Message[] = []): Conversation {
    const conversation: Conversation = {
      id: Date.now().toString(),
      title: messages.length > 0 ? messages[0].text.substring(0, 50) : 'Nouvelle conversation',
      messages: messages,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversations.update(convs => [conversation, ...convs]);
    this.saveConversations();
    this.saveCurrentConversation(conversation.id);
    
    return conversation;
  }

  updateConversation(id: string, messages: Message[]): void {
    this.conversations.update(convs => {
      const index = convs.findIndex(c => c.id === id);
      if (index !== -1) {
        const updated = {
          ...convs[index],
          messages: messages,
          updatedAt: new Date(),
          title: messages.length > 0 ? messages[0].text.substring(0, 50) : convs[index].title
        };
        convs[index] = updated;
      }
      return [...convs];
    });
    this.saveConversations();
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations().find(c => c.id === id);
  }

  deleteConversation(id: string): void {
    this.conversations.update(convs => convs.filter(c => c.id !== id));
    this.saveConversations();
    if (this.currentConversationId() === id) {
      this.saveCurrentConversation(null);
    }
  }

  newChat(): void {
    this.saveCurrentConversation(null);
  }
}
