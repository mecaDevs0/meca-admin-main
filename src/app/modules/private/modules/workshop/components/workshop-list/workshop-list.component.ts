import { Component, Input } from '@angular/core';
import { WorkshopService } from '../../services/workshop.service';

@Component({
  selector: 'app-workshop-list',
  templateUrl: './workshop-list.component.html',
  styleUrl: './workshop-list.component.scss'
})
export class WorkshopListComponent {
  @Input() controller!: WorkshopService;
}
