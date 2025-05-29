import { Component, Input } from '@angular/core';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-scheduling-filter',
  templateUrl: './scheduling-filter.component.html',
  styleUrl: './scheduling-filter.component.scss'
})
export class SchedulingFilterComponent {
  @Input() controller!: SchedulingService;
}
