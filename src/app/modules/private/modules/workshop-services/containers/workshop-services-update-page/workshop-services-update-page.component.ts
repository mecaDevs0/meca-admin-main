import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-update-page',
  templateUrl: './workshop-services-update-page.component.html',
  styleUrl: './workshop-services-update-page.component.scss',
})
export class WorkshopServicesUpdatePageComponent {
  constructor(
    public controller: WorkshopServicesService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getItem(activatedRoute);
  }
}
