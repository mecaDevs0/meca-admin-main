import { Pipe, PipeTransform } from '@angular/core';
import { EPaymentStatus } from '../enums/EPaymentStatus';

const PaymentStatusClass = [
  'badge-pending',
  'badge-success',
  'badge-canceled',
  'badge-canceled',
  'badge-canceled',
  'badge-success',
  'badge-chargeBack',
];

@Pipe({
  name: 'paymentStatus',
})
export class PaymentStatusPipe implements PipeTransform {
  transform(value: number | null, isClass: boolean = false): string {
    return isClass && value
      ? PaymentStatusClass[value]
      : isClass && !value
      ? 'N/A'
      : value
      ? EPaymentStatus[value]
      : 'N/A';
  }
}
