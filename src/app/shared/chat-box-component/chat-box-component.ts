import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
  @ViewChild('messagesContainer') private messagesContainerRef!: ElementRef<HTMLDivElement>;

  protected isChatOpen = false;
  protected draftMessage = '';
  protected showScrollToBottom = false;
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
    this.scrollToBottomSmooth();

    this.chatService.sendMessage(this.chatSessionId, content).subscribe({
      next: (data) => {
        this.messages().push({
          role: 'assistant',
          content: data,
          time: this.buildTimeLabel(),
        });
      },
      complete: () => {
        this.isLoading.set(false);
        this.scrollToBottomSmooth();
      },
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
    if (this.isChatOpen) {
      this.scrollToBottomSmooth();
    }
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

  protected onMessagesScroll(): void {
    const el = this.messagesContainerRef?.nativeElement;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.showScrollToBottom = distanceFromBottom > 100;
  }

  protected scrollToBottom(): void {
    const el = this.messagesContainerRef?.nativeElement;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  private scrollToBottomSmooth(): void {
    setTimeout(() => {
      this.scrollToBottom();
      this.showScrollToBottom = false;
    });
  }

  protected startNewChat(): void {
    this.chatSessionId = crypto.randomUUID();
    this.messages.set([]);
    this.showNewChatButton.set(false);
    this.draftMessage = '';
  }

}
