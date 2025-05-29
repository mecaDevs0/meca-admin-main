import { Pipe, PipeTransform } from '@angular/core';
import { ESchedulingStatus } from '../enums/ESchedulingStatus';

@Pipe({
  name: 'schedulingStatus',
})
export class SchedulingStatusPipe implements PipeTransform {
  transform(value: number | null): string {
    return value != null ? ESchedulingStatus[value] : 'N/A';
  }
}
