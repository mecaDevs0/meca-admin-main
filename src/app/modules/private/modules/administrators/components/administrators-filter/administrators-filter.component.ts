import { Component, Input } from '@angular/core';
import { AdministratorsService } from '../../services/administrators.service';

@Component({
  selector: 'app-administrators-filter',
  templateUrl: './administrators-filter.component.html',
  styleUrls: ['./administrators-filter.component.scss'],
})
export class AdministratorsFilterComponent {
  @Input() controller!: AdministratorsService;
}
