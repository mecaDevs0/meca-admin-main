import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dateToSeconds } from '@app/core/functions/date.function';
import { IDashboardData } from '@app/core/interfaces/IDashboardData';
import { HttpService } from '@app/core/services/http/http.service';
import { SessionService } from '@app/core/services/session/session.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  dashboardData: IDashboardData = {
    totalUsers: 0,
    totalClients: 0,
    totalWorkshops: 0,
    totalServices: 0,
    totalServicesScheduled: 0,
    totalOpenServices: 0,
    totalServicesCompleted: 0,
    totalRatings: 0,
    averageRatings: 0,
  };

  loading: boolean = false;
  listSearchForm!: FormGroup;

  constructor(
    private httpService: HttpService<IDashboardData>,
    public sessionService: SessionService
  ) {}

  getDashboardData = () => {
    this.loading = true;
    this.httpService.get(`UserAdministrator/Dashboard`).subscribe(
      ({ data }) => {
        this.dashboardData = data;
        this.dashboardData.totalUsers =
          this.dashboardData.totalClients + this.dashboardData.totalWorkshops;
        this.loading = false;
      },
      (err) => {
        this.loading = false;
      }
    );
  };
}
