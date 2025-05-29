import { NgModule } from '@angular/core';

// Modules
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '@shared/shared.module';

// Containers
import { DashboardComponent } from './dashboard.component';
import { DashboardReadPageComponent } from './containers/dashboard-read-page/dashboard-read-page.component';

//  Components
import { UsersComponent } from './components/users/users.component';
import { FiltersComponent } from './components/filters/filters.component';
import { ServicesComponent } from './components/services/services.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardReadPageComponent,
    UsersComponent,
    FiltersComponent,
    ServicesComponent,
  ],
  imports: [SharedModule, DashboardRoutingModule],
})
export class DashboardModule {}
