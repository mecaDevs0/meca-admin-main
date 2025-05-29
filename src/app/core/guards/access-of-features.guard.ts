import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '@services/storage/storage.service';
import { AsideMenuService } from '@app/modules/private/components/aside-menu/services/aside-menu.service';
import { IAsideMenuConfig } from '../interfaces/CORE/IAsideMenuConfig';

@Injectable({
  providedIn: 'root',
})
export class AccessOfFeaturesGuard {
  constructor(
    private storageService: StorageService,
    private router: Router,
    private asideMenuService: AsideMenuService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const { access, feature } = route.data;
    const rules = this.storageService.get('rules');

    if (rules) {
      const ruleIndex: number = this.asideMenuService.menuConfig.findIndex(
        (menu: IAsideMenuConfig) => menu.name === access
      );

      if (rules[ruleIndex][feature] === true) {
        return true;
      } else {
        this.router.navigate(['/access-denied']);
        return false;
      }
    } else {
      return true;
    }
  }
}
