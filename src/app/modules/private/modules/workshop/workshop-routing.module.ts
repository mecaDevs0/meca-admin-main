import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkshopComponent } from './workshop.component';
import { WorkshopReadPageComponent } from './containers/workshop-read-page/workshop-read-page.component';
import { WorkshopDetailsPageComponent } from './containers/workshop-details-page/workshop-details-page.component';

const routes: Routes = [
  {
    path: '',
    component: WorkshopComponent,
    children: [
      { path: '', component: WorkshopReadPageComponent },
      { path: 'view/:id', component: WorkshopDetailsPageComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkshopRoutingModule {}
