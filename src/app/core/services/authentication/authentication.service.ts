import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { IToken } from '@app/core/interfaces/CORE/IToken';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(public router: Router, private storageService: StorageService) {}

  setAuthentication(session: IToken, sessionName: string = 'session'): void {
    this.storageService.set(sessionName, session);
  }

  getAuthentication(sessionName: string = 'session'): IToken {
    return this.storageService.get(sessionName);
  }

  unsetAuthentication(): void {
    sessionStorage.clear();
    localStorage.clear();

    if (this.router.url.includes('/user/')) {
      this.router.navigate(['/user/login']);
      return;
    }

    this.router.navigate(['/login']);
  }

  isLoggedIn(sessionName: string = 'session'): boolean {
    const session = this.storageService.get(sessionName);
    return session ? true : false;
  }
}
