import { Component, Input } from '@angular/core';
import { AppUsersService } from '../../services/app-users.service';

@Component({
  selector: 'app-app-users-filter',
  templateUrl: './app-users-filter.component.html',
  styleUrls: ['./app-users-filter.component.scss'],
})
export class AppUsersFilterComponent {
  @Input() controller!: AppUsersService;
}
