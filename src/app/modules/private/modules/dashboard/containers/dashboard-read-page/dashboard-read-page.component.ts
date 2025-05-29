import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-read-page',
  templateUrl: './dashboard-read-page.component.html',
  styleUrls: ['./dashboard-read-page.component.scss'],
})
export class DashboardReadPageComponent implements OnInit {
  constructor(public controller: DashboardService) {}

  ngOnInit() {
    this.controller.getDashboardData();
  }
}
