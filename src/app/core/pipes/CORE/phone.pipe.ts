import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
})
export class PhonePipe implements PipeTransform {
  transform(value: string): unknown {
    let newVal = value?.replace(/\D/g, '');

    if (newVal?.length <= 9) {
      newVal = newVal?.replace(/^(\d{0,5})(\d{0,4})/, '$1-$2');
    } else if (newVal?.length <= 2) {
      newVal = newVal?.replace(/^(\d{0,2})/, '($1)');
    } else if (newVal?.length <= 4) {
      newVal = newVal?.replace(/^(\d{0,2})(\d{0,4})/, '($1) $2');
    } else if (newVal?.length > 4 && newVal?.length <= 10) {
      newVal = newVal?.replace(/^(\d{0,2})(\d{0,4})(\d{0,4})/, '($1) $2-$3');
    } else {
      newVal = newVal?.replace(/^(\d{0,2})(\d{0,5})(\d{0,4})/, '($1) $2-$3');
    }

    return newVal;
  }
}
