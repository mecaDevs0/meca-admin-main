import { Component, Input } from '@angular/core';
import { RatingService } from '../../services/rating.service';

@Component({
  selector: 'app-rating-filter',
  templateUrl: './rating-filter.component.html',
  styleUrl: './rating-filter.component.scss',
})
export class RatingFilterComponent {
  @Input() controller!: RatingService;
}
