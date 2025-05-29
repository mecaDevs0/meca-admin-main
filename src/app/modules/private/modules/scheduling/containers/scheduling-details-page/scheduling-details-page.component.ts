import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-scheduling-details-page',
  templateUrl: './scheduling-details-page.component.html',
  styleUrl: './scheduling-details-page.component.scss',
})
export class SchedulingDetailsPageComponent {
  constructor(
    public controller: SchedulingService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getItem(activatedRoute);
    this.controller.loadFormApprovalOrReprove();
  }
}
