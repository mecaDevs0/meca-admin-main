import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IGlobalClass } from '@app/core/interfaces/CORE/IGlobalClass';
import { IFormPage } from '@app/core/interfaces/CRUD/IFormPage';

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.scss'],
})
export class FormPageComponent implements IFormPage<any> {
  @Input() controller!: IGlobalClass<any>;
  @Input() customSubtitle!: string;
  @Input() hiddenBreadcrumb: boolean = false;

  constructor(public location: Location) {}

  handleBack() {
    this.location.back();
  }
}
