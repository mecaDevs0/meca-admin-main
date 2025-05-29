import { Component, Input } from '@angular/core';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';
import { IForm } from '@app/core/interfaces/CRUD/IForm';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements IForm<any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() customTitle!: string;
}
