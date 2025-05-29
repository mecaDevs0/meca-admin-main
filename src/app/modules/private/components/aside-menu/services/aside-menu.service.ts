import { Injectable } from '@angular/core';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { SessionService } from '../../../../../core/services/session/session.service';
import { StorageService } from '@app/core/services/storage/storage.service';
import { Router } from '@angular/router';
import { IUserAdministrator } from '@app/core/interfaces/IUserAdministrator';
import { IRule } from '@app/core/interfaces/CORE/IAccessLevel';
import {
  IAsideMenuConfig,
  EFunctionalities,
} from '@app/core/interfaces/CORE/IAsideMenuConfig';

@Injectable({
  providedIn: 'root',
})
export class AsideMenuService {
  menuConfig: IAsideMenuConfig[];
  user!: IUserAdministrator;

  constructor(
    private sessionService: SessionService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.menuConfig = [
      {
        name: EMenuItem['Dashboard'],
        nameShownInMenu: 'Dashboard',
        functionalities: [EFunctionalities.access],
        route: '/app/dashboard',
        svg: 'dashboard.svg',
        step: 1,
        order: 0,
        hidden: false,
      },
      {
        name: EMenuItem['Perfis de acesso'],
        nameShownInMenu: 'Perfis de acesso',
        functionalities: [
          EFunctionalities.access,
          EFunctionalities.delete,
          EFunctionalities.edit,
          EFunctionalities.write,
          EFunctionalities.enableDisable,
        ],
        route: '/app/access-profiles',
        svg: 'access-profiles.svg',
        step: 1,
        order: 1,
        hidden: false,
      },
      {
        name: EMenuItem['Administradores'],
        nameShownInMenu: 'Administradores',
        functionalities: [
          EFunctionalities.access,
          EFunctionalities.delete,
          EFunctionalities.edit,
          EFunctionalities.write,
          EFunctionalities.enableDisable,
        ],
        route: '/app/administrators',
        svg: 'administrators.svg',
        step: 1,
        order: 2,
        hidden: false,
      },
      {
        name: EMenuItem['Serviços'],
        nameShownInMenu: 'Serviços',
        functionalities: [
          EFunctionalities.access,
          EFunctionalities.delete,
          EFunctionalities.edit,
          EFunctionalities.write,
          EFunctionalities.enableDisable,
        ],
        route: '/app/services',
        svg: 'services.svg',
        step: 1,
        order: 3,
        hidden: false,
      },
      {
        name: EMenuItem['Taxas'],
        nameShownInMenu: 'Taxas',
        functionalities: [EFunctionalities.access, EFunctionalities.edit],
        route: '/app/fees',
        svg: 'fees.svg',
        step: 1,
        order: 4,
        hidden: false,
      },
      {
        name: EMenuItem['Oficinas'],
        nameShownInMenu: 'Oficinas',
        functionalities: [
          EFunctionalities.access,
          EFunctionalities.delete,
          EFunctionalities.enableDisable,
        ],
        route: '/app/workshop',
        svg: 'workshop.svg',
        step: 1,
        order: 5,
        hidden: false,
      },
      {
        name: EMenuItem['Lista de clientes'],
        nameShownInMenu: 'Lista de clientes',
        functionalities: [
          EFunctionalities.access,
          EFunctionalities.enableDisable,
        ],
        route: '/app/app-users',
        svg: 'app-users.svg',
        step: 1,
        order: 6,
        hidden: false,
      },
      {
        name: EMenuItem['Solicitações de serviço'],
        nameShownInMenu: 'Solicitações de serviço',
        functionalities: [EFunctionalities.access],
        route: '/app/scheduling',
        svg: 'scheduling.svg',
        step: 1,
        order: 7,
        hidden: false,
      },
      {
        name: EMenuItem['Relatório Financeiro'],
        nameShownInMenu: 'Relatório financeiro',
        functionalities: [EFunctionalities.access, EFunctionalities.export],
        route: '/app/financial-report',
        svg: 'financial-report.svg',
        step: 1,
        order: 8,
        hidden: false,
      },
      {
        name: EMenuItem['Notificações'],
        nameShownInMenu: 'Notificações',
        functionalities: [EFunctionalities.access, EFunctionalities.write],
        route: '/app/notifications',
        svg: 'notifications.svg',
        step: 1,
        order: 9,
        hidden: false,
      },
      {
        name: EMenuItem['Avaliações'],
        nameShownInMenu: 'Avaliações',
        functionalities: [EFunctionalities.access],
        route: '/app/rating',
        svg: 'rating.svg',
        step: 1,
        order: 10,
        hidden: false,
      },
    ].sort((a, b) => a.order - b.order);
  }

  async handleMenuItems() {
    if (!this.user?.id) {
      await this.getUser();
    }
  }

  async getUser() {
    this.user = await this.sessionService.getUserLogged();
  }

  handleMenuItemsFilter(name: EMenuItem): boolean {
    const ruleIndex: number = this.menuConfig.findIndex(
      (menu: IAsideMenuConfig) => menu.name === name
    );
    const rules = this.storageService.get('rules');
    return rules[ruleIndex]?.access === true;
  }

  handleNavigate(redirectTo: string | null = null) {
    if (redirectTo) {
      this.router.navigate([redirectTo]);
    } else {
      const rules: IRule[] = this.storageService.get('rules');
      const index = rules.findIndex((rule: IRule) => rule.access);
      this.router.navigate([this.menuConfig[index].route]);
    }
  }
}
