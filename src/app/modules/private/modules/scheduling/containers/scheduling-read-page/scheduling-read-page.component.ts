import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-scheduling-read-page',
  templateUrl: './scheduling-read-page.component.html',
  styleUrl: './scheduling-read-page.component.scss'
})
export class SchedulingReadPageComponent {
   constructor(
    public controller: SchedulingService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
