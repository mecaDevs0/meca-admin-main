import { Component, Input } from '@angular/core';
import { handlePercentage } from '@app/core/functions/utils-funtions';
import { IDashboardData } from '@app/core/interfaces/IDashboardData';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  @Input() dashboardData!: IDashboardData;

  constructor() {}

  getPercentage = (value: number, total: number) => {
    return handlePercentage(value, total);
  };
}
