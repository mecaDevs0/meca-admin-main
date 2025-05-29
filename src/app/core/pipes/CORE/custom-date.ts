import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
})
export class CustomDate implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: number | null, args: string = 'dd/MM/yyyy'): unknown {
    if (value) {
      const timestamp = value;
      return this.datePipe.transform(timestamp * 1000, args);
    }

    return 'N/A';
  }
}
