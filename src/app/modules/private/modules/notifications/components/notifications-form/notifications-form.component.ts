import { Component, Input } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
})
export class NotificationsFormComponent {
  @Input() controller!: NotificationsService;
}
