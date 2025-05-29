import { Component } from '@angular/core';
import { AdministratorsService } from '../../services/administrators.service';

@Component({
  selector: 'app-administrators-create-page',
  templateUrl: './administrators-create-page.component.html',
  styleUrls: ['./administrators-create-page.component.scss'],
})
export class AdministratorsCreatePageComponent {
  constructor(public controller: AdministratorsService) {
    this.controller.loadForm();
  }
}
