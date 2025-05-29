import { Component, Input } from '@angular/core';
import { WorkshopService } from '../../services/workshop.service';

@Component({
  selector: 'app-workshop-filter',
  templateUrl: './workshop-filter.component.html',
  styleUrl: './workshop-filter.component.scss'
})
export class WorkshopFilterComponent {
  @Input() controller!: WorkshopService;
}
