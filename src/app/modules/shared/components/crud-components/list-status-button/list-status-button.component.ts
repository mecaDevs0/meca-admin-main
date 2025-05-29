import { Component, Input } from '@angular/core';
import { EBlockedName } from '@app/core/enums/CRUD/EBlockedName';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';
import { IListStatus } from '@app/core/interfaces/CRUD/IListStatus';

@Component({
  selector: 'app-list-status-button',
  templateUrl: './list-status-button.component.html',
  styleUrls: ['./list-status-button.component.scss'],
})
export class ListStatusButtonComponent implements IListStatus<any, any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() item: any;
  @Input() index!: number;
  @Input() blockedName: EBlockedName = EBlockedName.dataBlocked;

  EFunctionalities = EFunctionalities;
  EBlockedName = EBlockedName;
}
