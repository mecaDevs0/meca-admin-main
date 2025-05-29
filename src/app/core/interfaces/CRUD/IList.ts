import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IList<T> {
  controller: IGlobalClass<T>;
  status: boolean;
  actions: boolean;
  btnAllSelect: boolean;
}
