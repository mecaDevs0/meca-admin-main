import { Component, Input } from '@angular/core';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-list',
  templateUrl: './workshop-services-list.component.html',
  styleUrl: './workshop-services-list.component.scss',
})
export class WorkshopServicesListComponent {
  @Input() controller!: WorkshopServicesService;
}
