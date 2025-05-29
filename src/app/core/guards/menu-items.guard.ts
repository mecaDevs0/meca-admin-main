import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AsideMenuService } from '@app/modules/private/components/aside-menu/services/aside-menu.service';
import { StorageService } from '@services/storage/storage.service';
import { IRule } from '../interfaces/CORE/IAccessLevel';
import { IAsideMenuConfig } from '../interfaces/CORE/IAsideMenuConfig';

@Injectable({
  providedIn: 'root',
})
export class MenuItemsGuard {
  constructor(
    private router: Router,
    private storageService: StorageService,
    private asideMenuService: AsideMenuService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const rules: IRule[] = JSON.parse(localStorage.getItem('rules') || '{}');
    const ruleIndex = this.asideMenuService.menuConfig.findIndex(
      (menu: IAsideMenuConfig) => menu.name === route.data?.access
    );

    if (rules[ruleIndex]?.access) {
      return true;
    } else {
      const session = this.storageService.get('session');
      if (session?.id) {
        this.router.navigate(['/access-denied']);
      } else {
        this.router.navigate(['/login']);
      }

      return false;
    }
  }
}
