import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EBlockedName } from '@app/core/enums/CRUD/EBlockedName';
import { EButtonsHidden } from '@app/core/enums/CRUD/EButtonsHidden';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';
import { IDetails } from '@app/core/interfaces/CRUD/IDetails';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements IDetails<any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() customSubtitle: string | null = null;
  @Input() buttonsHidden: EButtonsHidden[] = [];
  @Input() blockedName: EBlockedName = EBlockedName.dataBlocked;

  EButtonsHidden = EButtonsHidden;
  EFunctionalities = EFunctionalities;
  EBlockedName = EBlockedName;

  constructor(public location: Location) {}

  handleBack() {
    this.location.back();
  }
}
