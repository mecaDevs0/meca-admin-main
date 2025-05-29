import { Component, Input, OnInit } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications-filter',
  templateUrl: './notifications-filter.component.html',
  styleUrls: ['./notifications-filter.component.scss'],
})
export class NotificationsFilterComponent {
  @Input() controller!: NotificationsService;
}
