import { Component, Input } from '@angular/core';
import { AdministratorsService } from '../../services/administrators.service';

@Component({
  selector: 'app-administrators-list',
  templateUrl: './administrators-list.component.html',
  styleUrls: ['./administrators-list.component.scss'],
})
export class AdministratorsListComponent {
  @Input() controller!: AdministratorsService;
}
