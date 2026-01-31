import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private messageService: MessageService) {}

  success(summary: string, detail: string) {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  error(summary: string, detail: string) {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  info(summary: string, detail: string) {
    this.messageService.add({ severity: 'info', summary, detail });
  }

  warn(summary: string, detail: string) {
    console.log('[AlertService] warn() ejecutado', summary, detail);
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  clear() {
    this.messageService.clear();
  }
}
