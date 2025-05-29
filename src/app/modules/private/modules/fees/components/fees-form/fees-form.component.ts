import { Component, Input } from '@angular/core';
import { FeesService } from '../../services/fees.service';

@Component({
  selector: 'app-fees-form',
  templateUrl: './fees-form.component.html',
  styleUrl: './fees-form.component.scss',
})
export class FeesFormComponent {
  @Input() controller!: FeesService;
}
