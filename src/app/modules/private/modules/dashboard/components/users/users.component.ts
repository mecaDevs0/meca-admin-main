import { Component, Input } from '@angular/core';
import { IDashboardData } from '@app/core/interfaces/IDashboardData';
import { handlePercentage } from '@functions/utils-funtions';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  @Input() dashboardData!: IDashboardData;

  constructor() {}

  getPercentage = (value: number, total: number) => {
    return handlePercentage(value, total);
  };
}
