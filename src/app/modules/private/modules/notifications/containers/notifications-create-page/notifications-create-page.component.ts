import { Component } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';
import { EProfileNotificationsType } from '@app/core/enums/EProfileNotificationsType';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notifications-create-page',
  templateUrl: './notifications-create-page.component.html',
  styleUrls: ['./notifications-create-page.component.scss'],
})
export class NotificationsCreatePageComponent {
  constructor(
    public controller: NotificationsService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getListProfiles(EProfileNotificationsType.Clientes);
    this.controller.readOnInit(activatedRoute);
    this.controller.loadFilter();
    this.controller.loadForm();
  }

  EFunctionalities = EFunctionalities;
}
