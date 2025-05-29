import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IForm<T> {
  controller: IGlobalClass<T>;
  customTitle?: string;
}
