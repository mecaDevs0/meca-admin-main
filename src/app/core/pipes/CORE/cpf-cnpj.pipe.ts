import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpfOrCnpj',
})
export class CpfCnpjPipe implements PipeTransform {
  transform(value: string = ''): string {
    if (!value || value?.length < 10) {
      return value;
    } else if (value?.length < 12) {
      return `${value?.substr(0, 3)}.${value?.substr(3, 3)}.${value?.substr(
        6,
        3
      )}-${value?.substr(9, 2)}`;
    } else {
      return `${value?.substr(0, 2)}.${value?.substr(2, 3)}.${value?.substr(
        5,
        3
      )}/${value?.substr(8, 4)}-${value?.substr(12)}`;
    }
  }
}
