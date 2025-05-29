import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RatingRoutingModule } from './rating-routing.module';
import { RatingComponent } from './rating.component';
import { RatingReadPageComponent } from './containers/rating-read-page/rating-read-page.component';
import { RatingFilterComponent } from './components/rating-filter/rating-filter.component';
import { RatingListComponent } from './components/rating-list/rating-list.component';
import { SharedModule } from '@app/modules/shared/shared.module';

@NgModule({
  declarations: [
    RatingComponent,
    RatingReadPageComponent,
    RatingFilterComponent,
    RatingListComponent,
  ],
  imports: [CommonModule, SharedModule, RatingRoutingModule],
})
export class RatingModule {}
