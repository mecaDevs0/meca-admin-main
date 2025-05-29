import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-range-date',
  templateUrl: './range-date.component.html',
  styleUrls: ['./range-date.component.scss'],
})
export class RangeDateComponent {
  @Input() title: string = 'Data';
  @Input() form: FormGroup = new FormGroup([]);

  maxDateDefault = new Date().toISOString().slice(0, 10);
}
