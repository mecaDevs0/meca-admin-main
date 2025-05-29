import { Component, Input } from '@angular/core';
import { AccessLevelService } from '../../services/access-level.service';

@Component({
  selector: 'app-access-level-filter',
  templateUrl: './access-level-filter.component.html',
  styleUrls: ['./access-level-filter.component.scss'],
})
export class AccessLevelFilterComponent {
  @Input() controller!: AccessLevelService;
}
