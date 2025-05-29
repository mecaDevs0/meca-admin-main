import { Component, Input } from '@angular/core';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-filter',
  templateUrl: './workshop-services-filter.component.html',
  styleUrl: './workshop-services-filter.component.scss',
})
export class WorkshopServicesFilterComponent {
  @Input() controller!: WorkshopServicesService;
}
