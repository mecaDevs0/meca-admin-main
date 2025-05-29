import { Component, Input } from '@angular/core';
import { WorkshopService } from '../../services/workshop.service';

@Component({
  selector: 'app-workshop-details',
  templateUrl: './workshop-details.component.html',
  styleUrl: './workshop-details.component.scss'
})
export class WorkshopDetailsComponent {
  @Input() controller!: WorkshopService;
}
