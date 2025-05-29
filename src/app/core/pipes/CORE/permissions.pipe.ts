import { Pipe, PipeTransform } from '@angular/core';
import { AsideMenuService } from '../../../modules/private/components/aside-menu/services/aside-menu.service';

@Pipe({
  name: 'permissions',
})
export class PermissionsPipe implements PipeTransform {
  constructor(private asideMenuService: AsideMenuService) {}

  transform(value: number) {
    return this.asideMenuService.menuConfig[value];
  }
}
