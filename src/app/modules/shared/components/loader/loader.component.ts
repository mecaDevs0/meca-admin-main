import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<div
    class="loading"
    [ngStyle]="{
      'border-color': borderColor,
      'border-top-color': borderTopColor,
      'border-width': borderWidth,
      'width': width,
      'height': height
    }"
    >
  </div>`,
  styles: [`
    .loading {
      animation: is-rotating 0.6s linear infinite;
      border-style: solid;
      border-radius: 50%;
    }


    @keyframes is-rotating {
      to {
        transform: rotate(1turn);
      }
    }

  `]
})
export class LoaderComponent implements OnInit {
  @Input() width = '60px';
  @Input() height = '60px';
  @Input() borderTopColor = 'transparent'
  @Input() borderWidth = '10px';
  @Input() borderColor = 'transparent';

  constructor() { }

  ngOnInit(): void { }

}
