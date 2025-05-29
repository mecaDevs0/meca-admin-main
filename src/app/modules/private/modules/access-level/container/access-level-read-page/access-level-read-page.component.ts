import { Component } from '@angular/core';
import { AccessLevelService } from '../../services/access-level.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-access-level-read-page',
  templateUrl: './access-level-read-page.component.html',
  styleUrls: ['./access-level-read-page.component.scss'],
})
export class AccessLevelReadPageComponent {
  constructor(
    public controller: AccessLevelService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
