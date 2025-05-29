import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-export',
  templateUrl: './button-export.component.html',
  styleUrls: ['./button-export.component.scss']
})
export class ButtonExportComponent {
  @Input() class!: string;
  @Input() label!: string;
  @Input() loading!: boolean;
  @Input() labelLoading!: string;
}
