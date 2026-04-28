import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatBotService } from '../../core/services/chat-bot-service';
import { MarkdownModule } from 'ngx-markdown';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
  role: ChatRole;
  content: string;
  time: string;
}

@Component({
  selector: 'app-chat-box-component',
  imports: [FormsModule, MarkdownModule],
  templateUrl: './chat-box-component.html',
  styleUrl: './chat-box-component.css',
})
export class ChatBoxComponent {
  protected isChatOpen = false;
  protected draftMessage = '';
  protected readonly isLoading = signal(false);
  protected readonly showNewChatButton = signal(false);

  private readonly chatService = inject(ChatBotService);

  private chatSessionId: string | null = null;

  protected readonly quickPrompts: string[] = [
    'Khách sạn có hồ bơi không?',
    'Giờ nhận phòng và trả phòng?',
    'Có hỗ trợ đưa đón sân bay không?',
    'Gợi ý hạng phòng cho 2 người',
  ];

  protected readonly messages = signal<ChatMessage[]>([]);

  protected submitMessage(): void {
    const content = this.draftMessage.trim();
    if (!content) {
      return;
    }

    if (this.chatSessionId === null) {
      this.chatSessionId = crypto.randomUUID();
    }

    this.messages().push({
      role: 'user',
      content,
      time: this.buildTimeLabel(),
    });

    this.isLoading.set(true);
    this.draftMessage = '';

    this.chatService.sendMessage(this.chatSessionId, content).subscribe({
      next: (data) => {
        this.messages().push({
          role: 'assistant',
          content: data,
          time: this.buildTimeLabel(),
        });
      },
      complete: () => this.isLoading.set(false),
      error: (error) => {
        this.isLoading.set(false);
        this.messages().push({
          role: 'assistant',
          content: error.error.message,
          time: this.buildTimeLabel(),
        });
        if (error.error?.code === '13') {
          this.showNewChatButton.set(true);
        }
      },
    });
  }

  protected applyPrompt(prompt: string): void {
    this.draftMessage = prompt;
  }

  protected toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitMessage();
    }
  }

  private buildTimeLabel(): string {
    return new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  protected startNewChat(): void {
    this.chatSessionId = crypto.randomUUID();
    this.messages.set([]);
    this.showNewChatButton.set(false);
    this.draftMessage = '';
  }

}
