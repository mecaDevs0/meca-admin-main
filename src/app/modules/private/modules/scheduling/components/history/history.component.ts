import { Component, Input } from '@angular/core';
import { SchedulingService } from '../../services/scheduling.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  @Input() controller!: SchedulingService;

  configModalViewImage = {
    open: false,
    imageSrc: '',
    imageName: '',
  };

  handleModal(src: string): void {
    this.configModalViewImage = {
      open: true,
      imageSrc: src,
      imageName: '',
    };
  }
}
