import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdministratorsService } from '../../services/administrators.service';

@Component({
  selector: 'app-administrators-update-page',
  templateUrl: './administrators-update-page.component.html',
  styleUrls: ['./administrators-update-page.component.scss'],
})
export class AdministratorsUpdatePageComponent {
  constructor(
    public controller: AdministratorsService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.getItem(activatedRoute);
  }
}
