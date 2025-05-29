import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RatingReadPageComponent } from './containers/rating-read-page/rating-read-page.component';
import { RatingComponent } from './rating.component';

const routes: Routes = [
  {
    path: '',
    component: RatingComponent,
    children: [
      { path: '', component: RatingReadPageComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RatingRoutingModule {}
