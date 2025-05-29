import { Component, Input } from '@angular/core';
import { IModalConfig } from '@app/core/interfaces/CORE/IModalConfig';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() config: IModalConfig = {
    open: false,
    width: '1200px',
    height: '800px',
    title: '',
  };

  onClose(): void {
    this.config = {
      open: false,
      width: '1200px',
      height: '800px',
      title: '',
    };
  }
}
