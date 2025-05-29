import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkshopRoutingModule } from './workshop-routing.module';
import { WorkshopComponent } from './workshop.component';
import { WorkshopFilterComponent } from './components/workshop-filter/workshop-filter.component';
import { WorkshopListComponent } from './components/workshop-list/workshop-list.component';
import { WorkshopDetailsComponent } from './components/workshop-details/workshop-details.component';
import { WorkshopReadPageComponent } from './containers/workshop-read-page/workshop-read-page.component';
import { WorkshopDetailsPageComponent } from './containers/workshop-details-page/workshop-details-page.component';
import { SharedModule } from '@app/modules/shared/shared.module';

@NgModule({
  declarations: [
    WorkshopComponent,
    WorkshopFilterComponent,
    WorkshopListComponent,
    WorkshopDetailsComponent,
    WorkshopReadPageComponent,
    WorkshopDetailsPageComponent,
  ],
  imports: [CommonModule, SharedModule, WorkshopRoutingModule],
})
export class WorkshopModule {}
