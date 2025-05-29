import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { AccessLevelRoutingModule } from './access-level-routing.module';
import { AccessLevelComponent } from './access-level.component';
import { AccessLevelFilterComponent } from './components/access-level-filter/access-level-filter.component';
import { AccessLevelFormComponent } from './components/access-level-form/access-level-form.component';
import { AccessLevelListComponent } from './components/access-level-list/access-level-list.component';
import { AccessLevelCreatePageComponent } from './container/access-level-create-page/access-level-create-page.component';
import { AccessLevelUpdatePageComponent } from './container/access-level-update-page/access-level-update-page.component';
import { AccessLevelReadPageComponent } from './container/access-level-read-page/access-level-read-page.component';

@NgModule({
  declarations: [
    AccessLevelComponent,
    AccessLevelFilterComponent,
    AccessLevelFormComponent,
    AccessLevelListComponent,
    AccessLevelCreatePageComponent,
    AccessLevelUpdatePageComponent,
    AccessLevelReadPageComponent,
  ],
  imports: [SharedModule, AccessLevelRoutingModule],
})
export class AccessLevelModule {}
