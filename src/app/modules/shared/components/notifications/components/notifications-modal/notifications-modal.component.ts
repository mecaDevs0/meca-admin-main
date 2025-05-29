import { Component, Input } from '@angular/core';
import { INotificationConfig } from '@app/core/interfaces/CORE/INotificationConfig';
import { INotification } from '@app/core/interfaces/INotification';
import { HttpService } from '@services/http/http.service';
import { AlertService } from '@shared/components/alert/alert.service';

@Component({
  selector: 'app-notifications-modal',
  templateUrl: './notifications-modal.component.html',
  styleUrls: ['./notifications-modal.component.scss'],
})
export class NotificationsModalComponent {
  @Input() config: INotificationConfig = {
    open: false,
    notifications: null,
  };

  constructor(
    private alertService: AlertService,
    private httpService: HttpService<INotification>
  ) {}

  onClose(): void {
    this.config = {
      open: false,
      notifications: null,
    };
  }

  async handleDelete(item: INotification) {
    const confirm = await this.alertService.alert(
      'Deseja excluir essa notificação?'
    );
    if (confirm) {
      this.httpService.delete(`Notification/${item.id}`, true).subscribe(() => {
        this.config.notifications =
          this.config.notifications?.filter(
            (data: INotification) => data.id !== item.id
          ) || [];
      });
    }
  }
}
