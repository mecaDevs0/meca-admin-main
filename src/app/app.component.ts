import { Component } from '@angular/core';
import { CONFIG_BASE } from './core/config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = CONFIG_BASE.appName;
}
