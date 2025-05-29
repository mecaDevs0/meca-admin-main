import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CONFIG_BASE } from '@core/config';
import { AsideMenuService } from '../aside-menu/services/aside-menu.service';
import { SessionService } from '../../../../core/services/session/session.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  title: string = CONFIG_BASE.appName;
  dropdownIsOpen = false;
  currentRoute!: string;
  hasNewNotifications = false;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private location: Location,
    public asideMenuService: AsideMenuService,
    public sessionService: SessionService
  ) {}

  ngOnInit(): void {}

  handleDropdown = () => (this.dropdownIsOpen = !this.dropdownIsOpen);

  handleLogout = () => {
    this.authenticationService.unsetAuthentication();
    this.router.navigate(['/login']);
  };

  handleBack = () => this.location.back();
}
