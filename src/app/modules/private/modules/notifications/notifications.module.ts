import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { NotificationsFormComponent } from './components/notifications-form/notifications-form.component';
import { NotificationsCreatePageComponent } from './containers/notifications-create-page/notifications-create-page.component';
import { SharedModule } from '../../../shared/shared.module';
import { NotificationsFilterComponent } from './components/notifications-filter/notifications-filter.component';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationsFormComponent,
    NotificationsCreatePageComponent,
    NotificationsFilterComponent,
  ],
  imports: [CommonModule, SharedModule, NotificationsRoutingModule],
})
export class NotificationsModule {}
