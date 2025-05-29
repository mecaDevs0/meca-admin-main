import { Component, Input } from '@angular/core';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';
import { IList } from '@app/core/interfaces/CRUD/IList';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements IList<any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() status: boolean = true;
  @Input() actions: boolean = true;
  @Input() btnAllSelect: boolean = false;

  EFunctionalities = EFunctionalities;
}
