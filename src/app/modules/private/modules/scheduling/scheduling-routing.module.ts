import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchedulingComponent } from './scheduling.component';
import { SchedulingReadPageComponent } from './containers/scheduling-read-page/scheduling-read-page.component';
import { SchedulingDetailsPageComponent } from './containers/scheduling-details-page/scheduling-details-page.component';

const routes: Routes = [
  {
    path: '',
    component: SchedulingComponent,
    children: [
      { path: '', component: SchedulingReadPageComponent },
      { path: 'view/:id', component: SchedulingDetailsPageComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchedulingRoutingModule {}
