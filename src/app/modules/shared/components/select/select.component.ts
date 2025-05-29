import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { enumToList } from '@app/core/functions/enumToList';
import { ISelect } from '@app/core/interfaces/CORE/ISelect';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  @Input() listOrEnum!: ISelect[] | object;
  @Input() formGroup!: FormGroup;
  @Input() formControlName!: string;
  @Input() isEnum: boolean = false;
  @Input() multiple: boolean = false;
  @Input() label!: string;
  @Input() isRequired: boolean = false;
  @Input() showSearch: boolean = true;
  @Input() labelNoItems: string = 'Nenhum item econtrado.';

  list: ISelect[] = [];

  selectDropdownHidden = true;
  listSearchForm!: FormGroup;
  listBackup: Array<ISelect> = [];

  constructor(private fb: FormBuilder) {}

  ngOnChanges() {
    this.list = this.isEnum
      ? enumToList(this.listOrEnum)
      : (this.listOrEnum as ISelect[]);

    this.loadFilter();
  }

  handleSelect = (event: Event, item: ISelect) => {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (this.multiple) {
        if (this.isEnum) {
          this.formGroup.controls[this.formControlName].setValue([
            ...this.formGroup.controls[this.formControlName].value,
            item.id,
          ]);
        } else {
          this.formGroup.controls[this.formControlName].setValue([
            ...this.formGroup.controls[this.formControlName].value,
            item,
          ]);
        }
      } else {
        if (this.isEnum) {
          this.formGroup.controls[this.formControlName].setValue(item.id);
        } else {
          this.formGroup.controls[this.formControlName].setValue(item);
        }
      }
    } else {
      if (this.multiple) {
        if (this.isEnum) {
          const index = this.formGroup.controls[
            this.formControlName
          ].value.findIndex((el: string) => el === item.id);
          this.formGroup.controls[this.formControlName].value?.splice(index, 1);
        } else {
          const index = this.formGroup.controls[
            this.formControlName
          ].value.findIndex(
            (el: ISelect) => el.name?.trim() === item.name?.trim()
          );
          this.formGroup.controls[this.formControlName].value?.splice(index, 1);
        }

        if (!this.formGroup.get(this.formControlName)?.value?.length) {
          this.formGroup.controls[this.formControlName].markAsDirty();
          this.formGroup.controls[this.formControlName].markAsTouched();
          this.formGroup.controls[
            this.formControlName
          ].updateValueAndValidity();
        }
      } else {
        this.formGroup.controls[this.formControlName].setValue('');

        if (this.formGroup.get(this.formControlName)?.invalid) {
          this.formGroup.controls[this.formControlName].markAsDirty();
          this.formGroup.controls[this.formControlName].markAsTouched();
          this.formGroup.controls[
            this.formControlName
          ].updateValueAndValidity();
        }
      }
    }
  };

  handleChecked = (item: ISelect) => {
    let check;
    if (this.multiple) {
      if (this.isEnum) {
        check = this.formGroup.controls[this.formControlName].value?.find(
          (el: string) => el == item.id
        );
      } else {
        check = this.formGroup.controls[this.formControlName].value?.find(
          (el: ISelect) => el.name?.trim() === item.name?.trim()
        );
      }
    } else {
      if (this.isEnum) {
        check = this.formGroup.controls[this.formControlName].value === item.id;
      } else {
        check =
          this.formGroup.controls[this.formControlName].value?.name ===
          item.name?.trim();
      }
    }

    return check === false ||
      check === '' ||
      check === null ||
      check === undefined
      ? false
      : true;
  };

  handleValues = () => {
    let result = null;
    if (this.multiple) {
      if (this.isEnum) {
        if (this.formGroup.controls[this.formControlName].value?.length) {
          result = this.formGroup.controls[this.formControlName].value
            ?.map((el: string) => this.list[Number(el)].name)
            ?.join(', ');
        }
      } else {
        if (this.formGroup.controls[this.formControlName].value?.length) {
          result = this.formGroup.controls[this.formControlName].value
            ?.map((el: ISelect) => el?.name)
            ?.join(', ');
        }
      }
    } else {
      if (this.isEnum) {
        result =
          this.list[this.formGroup.controls[this.formControlName].value]
            ?.name || '';
      } else {
        result =
          this.formGroup.controls[this.formControlName].value?.name || '';
      }
    }

    return result;
  };

  handleMouseLeave() {
    if (!this.selectDropdownHidden) {
      this.selectDropdownHidden = true;
      this.formGroup.get(this.formControlName)?.markAllAsTouched();
    }
  }

  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
    });

    this.listenFilter();
    setTimeout(() => (this.listBackup = this.list), 1000);
  }

  listenFilter() {
    this.listSearchForm.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(({ search }) => {
        this.list = this.listBackup;

        if (search) {
          this.list = this.listBackup.filter((item) =>
            item.name?.toLowerCase()?.includes(search.toLowerCase())
          );
        }
      });
  }

  displayFieldCss(field: string, form?: FormGroup): { 'has-error': boolean } {
    return { 'has-error': this.isFieldValid(field, form) };
  }

  isFieldValid = (field: string, form?: FormGroup): boolean => {
    if (form) {
      return form.get(field)?.touched && form?.get(field)?.invalid
        ? true
        : false;
    }

    return this.formGroup.get(field)?.touched &&
      this.formGroup?.get(field)?.invalid
      ? true
      : false;
  };
}
