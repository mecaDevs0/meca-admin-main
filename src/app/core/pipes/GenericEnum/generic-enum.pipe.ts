import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genericEnum',
})
export class GenericEnumPipe implements PipeTransform {
  transform(
    value: string | number,
    genericEnum: { [key: string]: string }
  ): string {
    try {
      return genericEnum[value];
    } catch (error) {
      return 'Tipo desconhecido';
    }
  }
}
