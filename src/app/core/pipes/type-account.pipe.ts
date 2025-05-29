import { Pipe, PipeTransform } from '@angular/core';
import { ETypeAccount } from '../enums/ETypeAccount';

@Pipe({
  name: 'typeAccount',
})
export class TypeAccountPipe implements PipeTransform {
  transform(value: ETypeAccount | null): string {
    return value != null ? ETypeAccount[value] : 'N/A';
  }
}
