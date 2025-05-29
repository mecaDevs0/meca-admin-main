export interface IAccessLevel {
  name: string;
  rules: IRule[];
  isDefault: boolean;
  dataBlocked: number;
  disabled: number;
  created: number;
  id: string;
}

export interface IRule {
  menuItem: number;
  subMenu: number;
  access: boolean;
  edit: boolean;
  write: boolean;
  delete: boolean;
  export: boolean;
  enableDisable: boolean;
}
