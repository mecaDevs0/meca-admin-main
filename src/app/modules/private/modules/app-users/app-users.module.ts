import { NgModule } from '@angular/core';

import { AppUsersRoutingModule } from './app-users-routing.module';
import { AppUsersComponent } from './app-users.component';
import { AppUsersFilterComponent } from './components/app-users-filter/app-users-filter.component';
import { AppUsersListComponent } from './components/app-users-list/app-users-list.component';
import { AppUsersDetailsComponent } from './components/app-users-details/app-users-details.component';
import { AppUsersReadPageComponent } from './containers/app-users-read-page/app-users-read-page.component';
import { AppUsersDetailsPageComponent } from './containers/app-users-details-page/app-users-details-page.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    AppUsersComponent,
    AppUsersFilterComponent,
    AppUsersListComponent,
    AppUsersDetailsComponent,
    AppUsersReadPageComponent,
    AppUsersDetailsPageComponent,
  ],
  imports: [SharedModule, AppUsersRoutingModule],
})
export class AppUsersModule {}
