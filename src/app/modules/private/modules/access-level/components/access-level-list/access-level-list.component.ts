import { Component, Input } from '@angular/core';
import { AccessLevelService } from '../../services/access-level.service';

@Component({
  selector: 'app-access-level-list',
  templateUrl: './access-level-list.component.html',
  styleUrls: ['./access-level-list.component.scss'],
})
export class AccessLevelListComponent {
  @Input() controller!: AccessLevelService;
}
