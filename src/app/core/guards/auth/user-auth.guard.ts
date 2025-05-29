import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../../services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserAuthGuard implements CanActivate, CanLoad {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.isLoggedIn())
      return this.router.navigate(['/user/login'], {
        queryParams: { redirectTo: state.url },
      });
    return true;
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.isLoggedIn())
      return this.router.navigate(['/user/login'], {
        queryParams: { redirectTo: `/${segments.join('/')}` },
      });
    return true;
  }

  isLoggedIn(): boolean {
    const session = this.storageService.get('sessionUserApp');
    return session ? true : false;
  }
}
