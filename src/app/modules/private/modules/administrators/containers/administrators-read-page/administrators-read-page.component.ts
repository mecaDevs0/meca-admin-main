import { Component } from '@angular/core';
import { AdministratorsService } from '../../services/administrators.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-administrators-read-page',
  templateUrl: './administrators-read-page.component.html',
  styleUrls: ['./administrators-read-page.component.scss'],
})
export class AdministratorsReadPageComponent {
  constructor(
    public controller: AdministratorsService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getAccessLevel();
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
