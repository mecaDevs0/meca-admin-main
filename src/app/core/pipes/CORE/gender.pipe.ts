import { Pipe, PipeTransform } from '@angular/core';
import { EGender } from '../../enums/CORE/EGender';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {
  transform(value: number): string {
    return EGender[value];
  }
}
