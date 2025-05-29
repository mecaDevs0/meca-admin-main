import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { SchedulingComponent } from './scheduling.component';
import { SchedulingFilterComponent } from './components/scheduling-filter/scheduling-filter.component';
import { SchedulingListComponent } from './components/scheduling-list/scheduling-list.component';
import { SchedulingDetailsComponent } from './components/scheduling-details/scheduling-details.component';
import { SchedulingReadPageComponent } from './containers/scheduling-read-page/scheduling-read-page.component';
import { SchedulingDetailsPageComponent } from './containers/scheduling-details-page/scheduling-details-page.component';
import { SharedModule } from '@app/modules/shared/shared.module';
import { HistoryComponent } from './components/history/history.component';

@NgModule({
  declarations: [
    SchedulingComponent,
    SchedulingFilterComponent,
    SchedulingListComponent,
    SchedulingDetailsComponent,
    SchedulingReadPageComponent,
    SchedulingDetailsPageComponent,
    HistoryComponent,
  ],
  imports: [CommonModule, SharedModule, SchedulingRoutingModule],
})
export class SchedulingModule {}
