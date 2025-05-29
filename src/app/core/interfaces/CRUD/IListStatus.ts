import { EBlockedName } from '@app/core/enums/CRUD/EBlockedName';
import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IListStatus<T, I> {
  controller: IGlobalClass<T>;
  item: I;
  index: number | null;
  blockedName: EBlockedName;
}
