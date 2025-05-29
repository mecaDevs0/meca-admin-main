import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@services/authentication/authentication.service';
import { CONFIG_BASE } from '@core/config';
import { AsideMenuService } from './services/aside-menu.service';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IAsideMenuConfig } from '@app/core/interfaces/CORE/IAsideMenuConfig';

@Component({
  selector: 'app-aside-menu',
  templateUrl: './aside-menu.component.html',
  styleUrls: ['./aside-menu.component.scss'],
})
export class AsideMenuComponent implements OnInit {
  menuList: IAsideMenuConfig[] = this.asideMenuService.menuConfig;
  menuIsActive = true;
  responsiveWidth = 840;
  currentStep = CONFIG_BASE.currentStep;

  EMenuItem = EMenuItem;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private asideMenuService: AsideMenuService
  ) {}

  ngOnInit(): void {
    this.handleInnerWidth();
    window.onresize = () => this.handleInnerWidth();
  }

  handleInnerWidth = () => {
    window.innerWidth > this.responsiveWidth
      ? (this.menuIsActive = true)
      : (this.menuIsActive = false);
  };

  handleMenu = () => {
    if (window.innerWidth < this.responsiveWidth) {
      this.menuIsActive = !this.menuIsActive;
    }
  };

  handleLogout = () => {
    this.authenticationService.unsetAuthentication();
  };

  handleKeyPress = (event: KeyboardEvent, router: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      this.router.navigate([router]);
      this.handleMenu();
    }
  };

  handleMenuItemsFilter(name: EMenuItem) {
    return this.asideMenuService.handleMenuItemsFilter(name);
  }
}
