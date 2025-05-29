import { EButtonsHidden } from '@app/core/enums/CRUD/EButtonsHidden';
import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IListActions<T, I> {
  controller: IGlobalClass<T>;
  item: I;
  buttonsHidden?: EButtonsHidden[];
}
