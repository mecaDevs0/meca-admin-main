import { EMenuItem } from '../../enums/EMenuItem';

export interface IAsideMenuConfig {
  name: EMenuItem;
  nameShownInMenu: string;
  functionalities: EFunctionalities[];
  route: string;
  svg: string;
  step: number;
  order: number;
  hidden: boolean;
}

export enum EFunctionalities {
  write = 'write',
  access = 'access',
  delete = 'delete',
  edit = 'edit',
  enableDisable = 'enableDisable',
  export = 'export',
}
