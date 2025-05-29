import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-details-page',
  templateUrl: './workshop-services-details-page.component.html',
  styleUrl: './workshop-services-details-page.component.scss',
})
export class WorkshopServicesDetailsPageComponent {
  constructor(
    public controller: WorkshopServicesService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getItem(activatedRoute);
  }
}
