import { Component, Input } from '@angular/core';

interface ITooltip {
  percentage?: number;
  info?: string;
}

@Component({
  selector: 'app-graphic-line',
  templateUrl: './graphic-line.component.html',
  styleUrls: ['./graphic-line.component.scss'],
})
export class GraphicLineComponent {
  @Input() percentage!: number;
  @Input() tooltip!: ITooltip;
  @Input() color: string = '#4D82CB';
  @Input() backgroundColor: string = '#F5F5F5';
}
