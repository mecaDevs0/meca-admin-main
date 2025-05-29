import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IFilter<T> {
  controller: IGlobalClass<T>;
  withSearch: boolean;
  alignItems: EAlignItems;
  placeholder: string;
}

export enum EAlignItems {
  'flex-end' = 0,
  'center' = 1,
}
