import { Pipe, PipeTransform } from '@angular/core';
import { ESchedulingStatusTitle } from '../enums/ESchedulingStatusTitle';

@Pipe({
  name: 'schedulingStatusTitle',
})
export class SchedulingStatusTitlePipe implements PipeTransform {
  transform(value: number | null): string {
    return value != null ? ESchedulingStatusTitle[value] : 'N/A';
  }
}
