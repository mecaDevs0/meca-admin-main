import { Pipe, PipeTransform } from '@angular/core';
import { AsideMenuService } from '@app/modules/private/components/aside-menu/services/aside-menu.service';
import { StorageService } from '@services/storage/storage.service';
import {
  EFunctionalities,
  IAsideMenuConfig,
} from '../../interfaces/CORE/IAsideMenuConfig';
import { IRule } from '../../interfaces/CORE/IAccessLevel';
import { EMenuItem } from '@app/core/enums/EMenuItem';

@Pipe({
  name: 'accessLevel',
})
export class AccessLevelPipe implements PipeTransform {
  constructor(
    private storageService: StorageService,
    private asideMenuService: AsideMenuService
  ) {}

  transform(value: EMenuItem | null, ...args: EFunctionalities[]) {
    const index: number = this.asideMenuService.menuConfig.findIndex(
      (item: IAsideMenuConfig) => item.name === value
    );
    const rules: IRule[] = this.storageService.get('rules');
    if (rules[index]) {
      return rules[index][args[0]] === true;
    } else {
      return true;
    }
  }
}
