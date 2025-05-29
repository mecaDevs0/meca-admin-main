import { Component, Input } from '@angular/core';
import { INotificationConfig } from '@app/core/interfaces/CORE/INotificationConfig';
import { INotification } from '@app/core/interfaces/INotification';
import { HttpService } from '@services/http/http.service';
import { SessionService } from '../../../../core/services/session/session.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent {
  @Input() quantityNotifications: number = 0;
  modalConfig: INotificationConfig = {
    open: false,
    notifications: null,
  };

  constructor(
    private httpService: HttpService<INotification>,
    private sessionService: SessionService
  ) {}

  openModal() {
    const userId = this.sessionService.userLogged.id;
    if (userId) {
      this.httpService
        .get(
          `Notification?Limit=0&SetRead=true&TypeReference=0&UserId=${userId}`
        )
        .subscribe(({ data }) => {
          this.quantityNotifications = 0;
          this.modalConfig = {
            open: true,
            notifications: data,
          };
        });
    }
  }
}
