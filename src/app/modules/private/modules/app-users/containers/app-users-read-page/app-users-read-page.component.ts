import { Component } from '@angular/core';
import { AppUsersService } from '../../services/app-users.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-app-users-read-page',
  templateUrl: './app-users-read-page.component.html',
  styleUrls: ['./app-users-read-page.component.scss'],
})
export class AppUsersReadPageComponent {
  constructor(
    public controller: AppUsersService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
