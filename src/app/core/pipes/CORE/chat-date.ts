import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chatDate',
})
export class ChatDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: number | null, args: string = 'dd/MM/yyyy HH:mm'): unknown {
    if (value) {
      const date = new Date();
      const dateToday = `${date.getFullYear()}-${
        date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      }-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
      const dateYesterday = `${date.getFullYear()}-${
        date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      }-${date.getDate() - 1}`;
      if (dateToday === this.datePipe.transform(value * 1000, 'yyyy-MM-dd')) {
        return this.datePipe.transform(value * 1000, 'HH:mm') + ' - ' + 'Hoje';
      } else if (
        dateYesterday === this.datePipe.transform(value * 1000, 'yyyy-MM-dd')
      ) {
        return this.datePipe.transform(value * 1000, 'HH:mm') + ' - ' + 'Ontem';
      } else {
        return this.datePipe.transform(value * 1000, args);
      }
    }

    return 'Não informado';
  }
}
