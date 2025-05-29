import { Injectable } from '@angular/core';
import { IUserAdministrator } from '@app/core/interfaces/IUserAdministrator';
import { HttpService } from '@services/http/http.service';
import { StorageService } from '@services/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  userLogged!: IUserAdministrator;

  constructor(
    private httpService: HttpService<IUserAdministrator>,
    private storageService: StorageService
  ) {}

  getUserLogged = (): Promise<IUserAdministrator> => {
    return new Promise((resolve) => {
      this.httpService
        .get('UserAdministrator/GetInfo')
        .subscribe(async ({ data }) => {
          this.storageService.set('userId', data?.id);
          this.userLogged = data;
          if (data?.accessLevel?.id) this.getAccessLevel(data?.accessLevel?.id);
          resolve(data);
        });
    });
  };

  getAccessLevel(id: string) {
    this.httpService.get(`AccessLevel/${id}`).subscribe(async ({ data }) => {
      this.storageService.set('rules', data.rules);
    });
  }

  async getUserLoggedId(): Promise<string> {
    const { id } = this.userLogged?.id
      ? { id: this.userLogged?.id }
      : await this.getUserLogged();

    return id;
  }
}
