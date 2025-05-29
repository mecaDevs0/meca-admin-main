import { Component, Input } from '@angular/core';
import { AppUsersService } from '../../services/app-users.service';

@Component({
  selector: 'app-app-users-details',
  templateUrl: './app-users-details.component.html',
  styleUrls: ['./app-users-details.component.scss'],
})
export class AppUsersDetailsComponent {
  @Input() controller!: AppUsersService;
}
