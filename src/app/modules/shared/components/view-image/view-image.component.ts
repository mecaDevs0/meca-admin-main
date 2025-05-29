import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.scss'],
})
export class ViewImageComponent implements OnInit {
  @Input() config = {
    open: false,
    imageSrc: '',
    imageName: '',
  };

  constructor() {}

  ngOnInit(): void {}

  onClose(): void {
    this.config = {
      open: false,
      imageSrc: '',
      imageName: '',
    };
  }
}
