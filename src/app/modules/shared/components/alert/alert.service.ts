import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  observer: EventEmitter<any> = new EventEmitter<any>();
  response: boolean | undefined;
  hasReasonResponse: boolean | undefined;
  reasonResponse: string | null = null;

  constructor() {}

  alert = (message: string = 'Tem certeza que deseja excluir este item?') => {
    this.response = undefined;

    return new Promise((resolve) => {
      const config = {
        title: message,
        open: true,
      };

      this.observer.next(config);

      const interval = setInterval(() => {
        if (this.response === true) {
          clearInterval(interval);
          resolve(true);
        } else if (this.response === false) {
          clearInterval(interval);
          resolve(false);
        }
      }, 500);
    });
  };

  reason = (message: string = 'Escreva o motivo.') => {
    this.hasReasonResponse = undefined;

    return new Promise((resolve) => {
      const config = {
        title: message,
        open: true,
        isReason: true,
      };

      this.observer.next(config);

      const interval = setInterval(() => {
        if (this.hasReasonResponse === true) {
          clearInterval(interval);
          resolve(this.reasonResponse);
        } else if (this.hasReasonResponse === false) {
          clearInterval(interval);
          resolve(null);
        }
      }, 500);
    });
  };
}
