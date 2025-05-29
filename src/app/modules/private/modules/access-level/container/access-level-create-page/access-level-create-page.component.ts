import { Component } from '@angular/core';
import { AccessLevelService } from '../../services/access-level.service';

@Component({
  selector: 'app-access-level-create-page',
  templateUrl: './access-level-create-page.component.html',
  styleUrls: ['./access-level-create-page.component.scss'],
})
export class AccessLevelCreatePageComponent {
  constructor(
    public controller: AccessLevelService
  ) {
    this.controller.loadForm();
  }
}

