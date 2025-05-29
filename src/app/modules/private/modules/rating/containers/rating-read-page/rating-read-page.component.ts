import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RatingService } from '../../services/rating.service';

@Component({
  selector: 'app-rating-read-page',
  templateUrl: './rating-read-page.component.html',
  styleUrl: './rating-read-page.component.scss',
})
export class RatingReadPageComponent {
  constructor(
    public controller: RatingService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
