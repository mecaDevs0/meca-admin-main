import { NgModule } from '@angular/core';

import { AdministratorsRoutingModule } from './administrators-routing.module';
import { AdministratorsComponent } from './administrators.component';
import { AdministratorsFilterComponent } from './components/administrators-filter/administrators-filter.component';
import { AdministratorsFormComponent } from './components/administrators-form/administrators-form.component';
import { AdministratorsListComponent } from './components/administrators-list/administrators-list.component';
import { AdministratorsCreatePageComponent } from './containers/administrators-create-page/administrators-create-page.component';
import { AdministratorsReadPageComponent } from './containers/administrators-read-page/administrators-read-page.component';
import { AdministratorsUpdatePageComponent } from './containers/administrators-update-page/administrators-update-page.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    AdministratorsComponent,
    AdministratorsFilterComponent,
    AdministratorsFormComponent,
    AdministratorsListComponent,
    AdministratorsCreatePageComponent,
    AdministratorsReadPageComponent,
    AdministratorsUpdatePageComponent,
  ],
  imports: [SharedModule, AdministratorsRoutingModule],
})
export class AdministratorsModule {}
