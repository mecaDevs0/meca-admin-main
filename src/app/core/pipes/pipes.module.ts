import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessLevelPipe } from './CORE/access-level.pipe';
import { ChatDatePipe } from './CORE/chat-date';
import { CpfCnpjPipe } from './CORE/cpf-cnpj.pipe';
import { CrudPipe } from './CORE/crud.pipe';
import { CustomDate } from './CORE/custom-date';
import { DaysOfWeekPipe } from './CORE/days-of-week.pipe';
import { GenderPipe } from './CORE/gender.pipe';
import { PermissionsPipe } from './CORE/permissions.pipe';
import { PhonePipe } from './CORE/phone.pipe';
import { GenericEnumPipe } from './GenericEnum/generic-enum.pipe';
import { PaymentMethodsPipe } from './payment-methods.pipe';
import { PaymentStatusPipe } from './payment-status.pipe';
import { SafeUrlPipe } from './SafeUrl/safe-url.pipe';
import { WorkshopStatusPipe } from './workshop-status.pipe';
import { TypeAccountPipe } from './type-account.pipe';
import { SchedulingStatusPipe } from './scheduling-status.pipe';
import { SchedulingStatusTitlePipe } from './scheduling-status-title.pipe';

const pipes = [
  SafeUrlPipe,
  GenderPipe,
  CpfCnpjPipe,
  PhonePipe,
  CustomDate,
  ChatDatePipe,
  AccessLevelPipe,
  PermissionsPipe,
  DaysOfWeekPipe,
  CrudPipe,
  GenericEnumPipe,
  SafeUrlPipe,
  PaymentMethodsPipe,
  PaymentStatusPipe,
  WorkshopStatusPipe,
  TypeAccountPipe,
  SchedulingStatusPipe,
  SchedulingStatusTitlePipe,
];

@NgModule({
  declarations: [...pipes],
  imports: [CommonModule],
  exports: [...pipes],
})
export class PipesModule {}
