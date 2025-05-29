import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccessLevelService } from '../../services/access-level.service';

@Component({
  selector: 'app-access-level-update-page',
  templateUrl: './access-level-update-page.component.html',
  styleUrls: ['./access-level-update-page.component.scss'],
})
export class AccessLevelUpdatePageComponent {
  constructor(
    public controller: AccessLevelService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.controller.getItem(activatedRoute);
  }
}
