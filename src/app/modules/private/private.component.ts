import { Component, OnInit } from '@angular/core';
import { AsideMenuService } from './components/aside-menu/services/aside-menu.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss'],
})
export class PrivateComponent implements OnInit {
  constructor(private asideMenuService: AsideMenuService) {}

  ngOnInit() {
    this.asideMenuService.handleMenuItems();
  }
}
