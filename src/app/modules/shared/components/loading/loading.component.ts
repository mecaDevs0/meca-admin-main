import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  @Input() loading: boolean = false;
  @Input() backgroundColor = 'var(--secondaryColor)';

  constructor() { }

  ngOnInit() { }
}
