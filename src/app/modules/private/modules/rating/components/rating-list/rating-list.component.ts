import { Component, Input } from '@angular/core';
import { RatingService } from '../../services/rating.service';

@Component({
  selector: 'app-rating-list',
  templateUrl: './rating-list.component.html',
  styleUrl: './rating-list.component.scss',
})
export class RatingListComponent {
  @Input() controller!: RatingService;
}
