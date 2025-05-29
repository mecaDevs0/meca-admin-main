import { Location } from '@angular/common';
import { EBlockedName } from '@app/core/enums/CRUD/EBlockedName';
import { EButtonsHidden } from '@app/core/enums/CRUD/EButtonsHidden';
import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IDetails<T> {
  controller: IGlobalClass<T>;
  customSubtitle?: string | null;
  buttonsHidden: EButtonsHidden[];
  blockedName: EBlockedName;
  location: Location;
  handleBack(): void;
}
