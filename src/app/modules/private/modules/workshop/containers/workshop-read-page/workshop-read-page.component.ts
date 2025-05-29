import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkshopService } from '../../services/workshop.service';

@Component({
  selector: 'app-workshop-read-page',
  templateUrl: './workshop-read-page.component.html',
  styleUrl: './workshop-read-page.component.scss'
})
export class WorkshopReadPageComponent {
   constructor(
    public controller: WorkshopService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
