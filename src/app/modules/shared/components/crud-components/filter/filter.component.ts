import { Component, Input } from '@angular/core';
import { GlobalClass } from '@app/core/classes/global.class';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';
import { EAlignItems, IFilter } from '@app/core/interfaces/CRUD/IFilter';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements IFilter<any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() withSearch: boolean = true;
  @Input() alignItems: EAlignItems = EAlignItems['flex-end'];
  @Input() placeholder: string = '';
  @Input() width: string = 'auto';
}
