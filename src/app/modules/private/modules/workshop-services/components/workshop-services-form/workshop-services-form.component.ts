import { Component, Input } from '@angular/core';
import { WorkshopServicesService } from '../../services/workshop-services.service';

@Component({
  selector: 'app-workshop-services-form',
  templateUrl: './workshop-services-form.component.html',
  styleUrl: './workshop-services-form.component.scss',
})
export class WorkshopServicesFormComponent {
  @Input() controller!: WorkshopServicesService;
}
