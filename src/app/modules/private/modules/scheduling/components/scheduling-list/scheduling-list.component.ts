import { Component, Input } from '@angular/core';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-scheduling-list',
  templateUrl: './scheduling-list.component.html',
  styleUrl: './scheduling-list.component.scss'
})
export class SchedulingListComponent {
  @Input() controller!: SchedulingService;
}
