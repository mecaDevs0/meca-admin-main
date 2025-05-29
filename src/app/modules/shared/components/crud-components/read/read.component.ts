import { Component, Input } from '@angular/core';
import { EButtonsHidden } from '@app/core/enums/CRUD/EButtonsHidden';
import { ICustomLinks } from '@app/core/interfaces/CRUD/ICustomLinks';
import { IRead } from '@app/core/interfaces/CRUD/IRead';
import { EFunctionalities } from '../../../../../core/interfaces/CORE/IAsideMenuConfig';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';

@Component({
  selector: 'app-read',
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.scss'],
})
export class ReadComponent implements IRead<any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() buttonsHidden: EButtonsHidden[] = [];
  @Input() customLinks: ICustomLinks[] = [];

  EButtonsHidden = EButtonsHidden;
  EFunctionalities = EFunctionalities;

  buttonNotificationHidden = true;

  constructor() {
    this.handleButtonNotifications();
  }

  handleButtonNotifications() {
    if (location.href.includes('notifications')) {
      this.buttonNotificationHidden = false;
    }
  }
}
