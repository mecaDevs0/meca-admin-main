import { Component, Input } from '@angular/core';
import { AdministratorsService } from '../../services/administrators.service';

@Component({
  selector: 'app-administrators-form',
  templateUrl: './administrators-form.component.html',
  styleUrls: ['./administrators-form.component.scss'],
})
export class AdministratorsFormComponent {
  @Input() controller!: AdministratorsService;
}
