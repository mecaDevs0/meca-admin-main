import { Component, Input } from '@angular/core';
import { EButtonsHidden } from '@app/core/enums/CRUD/EButtonsHidden';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';
import { IListActions } from '@app/core/interfaces/CRUD/IListActions';

@Component({
  selector: 'app-list-actions-button',
  templateUrl: './list-actions-button.component.html',
  styleUrls: ['./list-actions-button.component.scss'],
})
export class ListActionsButtonComponent implements IListActions<any, any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() item: any;
  @Input() buttonsHidden!: EButtonsHidden[];

  EButtonsHidden = EButtonsHidden;
  EFunctionalities = EFunctionalities;
}
