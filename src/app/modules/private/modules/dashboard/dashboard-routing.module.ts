import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Containers
import { DashboardComponent } from './dashboard.component';
import { DashboardReadPageComponent } from './containers/dashboard-read-page/dashboard-read-page.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardReadPageComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
