import { Component, Input, OnInit } from '@angular/core';
import { AppUsersService } from '../../services/app-users.service';

@Component({
  selector: 'app-app-users-list',
  templateUrl: './app-users-list.component.html',
  styleUrls: ['./app-users-list.component.scss'],
})
export class AppUsersListComponent {
  @Input() controller!: AppUsersService;
}
