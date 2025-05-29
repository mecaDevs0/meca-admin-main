import { Component } from '@angular/core';
import { FeesService } from '../../services/fees.service';

@Component({
  selector: 'app-fees-update-page',
  templateUrl: './fees-update-page.component.html',
  styleUrl: './fees-update-page.component.scss',
})
export class FeesUpdatePageComponent {
  constructor(public controller: FeesService) {
    this.controller.loadForm();
    this.controller.getItem();
  }
}
