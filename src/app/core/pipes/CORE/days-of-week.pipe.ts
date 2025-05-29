import { Pipe, PipeTransform } from '@angular/core';
import { EDaysOfWeek } from '../../enums/CORE/EDaysOfWeek';

@Pipe({
  name: 'daysOfWeek',
})
export class DaysOfWeekPipe implements PipeTransform {
  transform(value: number): string {
    return EDaysOfWeek[value];
  }
}
