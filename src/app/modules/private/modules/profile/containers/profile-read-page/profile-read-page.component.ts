import { Component } from '@angular/core';
import { AsideMenuService } from '@app/modules/private/components/aside-menu/services/aside-menu.service';

@Component({
  selector: 'app-profile-read-page',
  templateUrl: './profile-read-page.component.html',
  styleUrls: ['./profile-read-page.component.scss'],
})
export class ProfileReadPageComponent {
  constructor(public asideMenuService: AsideMenuService) {}
}
