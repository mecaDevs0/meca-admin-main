import { EButtonsHidden } from '@app/core/enums/CRUD/EButtonsHidden';
import { ICustomLinks } from './ICustomLinks';
import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IRead<T> {
  controller: IGlobalClass<T>;
  buttonsHidden?: EButtonsHidden[];
  customLinks?: ICustomLinks[];
}
