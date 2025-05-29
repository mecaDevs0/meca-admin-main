import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkshopService } from '../../services/workshop.service';

@Component({
  selector: 'app-workshop-details-page',
  templateUrl: './workshop-details-page.component.html',
  styleUrl: './workshop-details-page.component.scss',
})
export class WorkshopDetailsPageComponent {
  constructor(
    public controller: WorkshopService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getItem(activatedRoute);
    this.controller.configViewWorkshopDocument = {
      open: false,
      imageScr: '',
      imageName: '',
    };
  }
}
