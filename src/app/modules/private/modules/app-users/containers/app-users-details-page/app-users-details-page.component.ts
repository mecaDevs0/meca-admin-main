import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppUsersService } from '../../services/app-users.service';

@Component({
  selector: 'app-app-users-details-page',
  templateUrl: './app-users-details-page.component.html',
  styleUrls: ['./app-users-details-page.component.scss'],
})
export class AppUsersDetailsPageComponent {
  constructor(
    public controller: AppUsersService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getItem(activatedRoute);
  }
}
