import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkshopServicesRoutingModule } from './workshop-services-routing.module';
import { WorkshopServicesComponent } from './workshop-services.component';
import { WorkshopServicesFilterComponent } from './components/workshop-services-filter/workshop-services-filter.component';
import { WorkshopServicesFormComponent } from './components/workshop-services-form/workshop-services-form.component';
import { WorkshopServicesListComponent } from './components/workshop-services-list/workshop-services-list.component';
import { WorkshopServicesCreatePageComponent } from './containers/workshop-services-create-page/workshop-services-create-page.component';
import { WorkshopServicesReadPageComponent } from './containers/workshop-services-read-page/workshop-services-read-page.component';
import { WorkshopServicesUpdatePageComponent } from './containers/workshop-services-update-page/workshop-services-update-page.component';
import { SharedModule } from '@app/modules/shared/shared.module';
import { WorkshopServicesDetailsComponent } from './components/workshop-services-details/workshop-services-details.component';
import { WorkshopServicesDetailsPageComponent } from './containers/workshop-services-details-page/workshop-services-details-page.component';

@NgModule({
  declarations: [
    WorkshopServicesComponent,
    WorkshopServicesFilterComponent,
    WorkshopServicesFormComponent,
    WorkshopServicesListComponent,
    WorkshopServicesCreatePageComponent,
    WorkshopServicesReadPageComponent,
    WorkshopServicesUpdatePageComponent,
    WorkshopServicesDetailsComponent,
    WorkshopServicesDetailsPageComponent,
  ],
  imports: [CommonModule, SharedModule, WorkshopServicesRoutingModule],
})
export class WorkshopServicesModule {}
