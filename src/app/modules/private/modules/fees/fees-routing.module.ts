import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeesComponent } from './fees.component';
import { FeesUpdatePageComponent } from './containers/fees-update-page/fees-update-page.component';

const routes: Routes = [
  {
    path: '',
    component: FeesComponent,
    children: [
      { path: '', component: FeesUpdatePageComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeesRoutingModule {}
