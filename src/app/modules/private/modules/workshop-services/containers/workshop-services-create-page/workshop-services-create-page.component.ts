import { Component } from '@angular/core';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-create-page',
  templateUrl: './workshop-services-create-page.component.html',
  styleUrl: './workshop-services-create-page.component.scss',
})
export class WorkshopServicesCreatePageComponent {
  constructor(public controller: WorkshopServicesService) {
    this.controller.loadForm();
  }
}
