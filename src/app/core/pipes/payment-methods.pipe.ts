import { Pipe, PipeTransform } from '@angular/core';
import { EPaymentMethod } from '../enums/EPaymentMethod';

@Pipe({
  name: 'paymentMethods',
})
export class PaymentMethodsPipe implements PipeTransform {
  transform(value: number | null): string {
    return value ? EPaymentMethod[value] : 'N/A';
  }
}
