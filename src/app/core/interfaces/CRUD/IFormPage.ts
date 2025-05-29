import { Location } from '@angular/common';
import { IGlobalClass } from '../CORE/IGlobalClass';

export interface IFormPage<T> {
  controller: IGlobalClass<T>;
  customSubtitle?: string;
  location: Location;
  handleBack(): void;
}
