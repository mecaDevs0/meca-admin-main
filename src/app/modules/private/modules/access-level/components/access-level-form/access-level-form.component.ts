import { Component, Input } from '@angular/core';
import { AccessLevelService } from '../../services/access-level.service';

@Component({
  selector: 'app-access-level-form',
  templateUrl: './access-level-form.component.html',
  styleUrls: ['./access-level-form.component.scss'],
})
export class AccessLevelFormComponent {
  @Input() controller!: AccessLevelService;
}
