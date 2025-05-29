import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-graph-indicator',
  templateUrl: './graph-indicator.component.html',
  styleUrls: ['./graph-indicator.component.scss']
})
export class GraphIndicatorComponent {
  @Input() color!: string;
}
