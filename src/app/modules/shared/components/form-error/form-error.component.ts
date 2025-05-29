import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { FormValidations } from '@classes/form-validation';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss'],
})
export class FormErrorComponent implements OnInit {
  @Input() control!: AbstractControl | null;
  @Input() label!: string;

  constructor() {}

  ngOnInit(): void {}

  get errorMessage() {
    for (const propertyName in this.control?.errors) {
      if (
        this.control?.errors.hasOwnProperty(propertyName) &&
        (this.control?.touched || this.control?.dirty)
      ) {
        return FormValidations.getErrorMsg(
          this.label,
          propertyName,
          this.control.errors[propertyName]
        );
      }
    }
    return null;
  }
}
