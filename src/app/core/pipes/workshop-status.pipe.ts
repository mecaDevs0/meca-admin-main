import { Pipe, PipeTransform } from '@angular/core';
import { EWorkshopStatus } from '../enums/EWorkshopStatus';

const workshopStatusClass = [
  'badge-pending',
  'badge-success',
  'badge-canceled',
];

@Pipe({
  name: 'workshopStatus',
})
export class WorkshopStatusPipe implements PipeTransform {
  transform(value: EWorkshopStatus | null, isClass: boolean = false): string {
    return isClass
      ? workshopStatusClass[value as number]
      : value != null
      ? EWorkshopStatus[value]
      : 'N/A';
  }
}
