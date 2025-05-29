import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeesRoutingModule } from './fees-routing.module';
import { FeesComponent } from './fees.component';
import { FeesUpdatePageComponent } from './containers/fees-update-page/fees-update-page.component';
import { FeesFormComponent } from './components/fees-form/fees-form.component';
import { SharedModule } from '@app/modules/shared/shared.module';

@NgModule({
  declarations: [FeesComponent, FeesUpdatePageComponent, FeesFormComponent],
  imports: [CommonModule, SharedModule, FeesRoutingModule],
})
export class FeesModule {}
