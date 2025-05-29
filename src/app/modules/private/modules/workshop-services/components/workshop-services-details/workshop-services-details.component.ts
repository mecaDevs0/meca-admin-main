import { Component, Input } from '@angular/core';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-details',
  templateUrl: './workshop-services-details.component.html',
  styleUrl: './workshop-services-details.component.scss',
})
export class WorkshopServicesDetailsComponent {
  @Input() controller!: WorkshopServicesService;
}
