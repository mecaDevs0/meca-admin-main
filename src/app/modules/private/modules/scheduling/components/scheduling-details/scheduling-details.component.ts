import { Component, Input } from '@angular/core';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-scheduling-details',
  templateUrl: './scheduling-details.component.html',
  styleUrl: './scheduling-details.component.scss'
})
export class SchedulingDetailsComponent {
  @Input() controller!: SchedulingService;
}
