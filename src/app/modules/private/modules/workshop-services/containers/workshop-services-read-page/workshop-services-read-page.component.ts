import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-read-page',
  templateUrl: './workshop-services-read-page.component.html',
  styleUrl: './workshop-services-read-page.component.scss',
})
export class WorkshopServicesReadPageComponent {
  constructor(
    public controller: WorkshopServicesService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
