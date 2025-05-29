import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ICountry } from '@app/core/interfaces/CORE/ICountry';
import { MegaleiosService } from '@app/core/services/megaleios/megaleios.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface IPhoneCode {
  code: string;
  name: string;
  native: string;
  phone: string;
  capital: string;
  currency: string;
  flag: string;
  id: string;
}

@Component({
  selector: 'app-international-telephone',
  templateUrl: './international-telephone.component.html',
  styleUrls: ['./international-telephone.component.scss'],
})
export class InternationalTelephoneComponent {
  @Input() formGroup!: FormGroup;
  @Input() formControlName!: string;
  @Input() codeFormControlName!: string;

  countriesCodes: ICountry[] = [];
  listSearchForm!: FormGroup;
  isOpenModal: boolean = false;
  listBackup: Array<ICountry> = [];
  mask: string = '(00) 0000-0000||(00) 00000-0000';

  constructor(
    private megaleiosService: MegaleiosService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getCodeCountries();
    this.loadFilter();
  }

  getCodeCountries() {
    this.megaleiosService.getCountries().subscribe(({ data }) => {
      this.countriesCodes = data;
    });
  }

  handleEmitterPhoneCode(phoneCode: IPhoneCode): void {
    switch (phoneCode.phone) {
      case 'US':
        this.mask = '(000) 000-0000';
        break;

      case 'BR':
        this.mask = '(00) 0000-0000||(00) 00000-0000';
        break;

      default:
        this.mask = '999999999999999';
        break;
    }

    this.formGroup.get(this.codeFormControlName)?.setValue(phoneCode.code);
    this.close();
  }

  open(): void {
    this.isOpenModal = true;
  }

  close(): void {
    this.isOpenModal = false;
    this.listSearchForm.get('search')?.setValue('');
    this.countriesCodes = this.listBackup;
  }

  displayFieldCss(field: string): { 'has-error': boolean } {
    return { 'has-error': this.isFieldValid(field) };
  }

  isFieldValid = (field: string): boolean => {
    return this.formGroup.get(field)?.touched &&
      this.formGroup?.get(field)?.invalid
      ? false
      : true;
  };

  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
    });

    this.listenFilter();
    setTimeout(() => (this.listBackup = this.countriesCodes), 1000);
  }

  listenFilter() {
    this.listSearchForm.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(({ search }) => {
        this.countriesCodes = this.listBackup;

        if (search) {
          this.countriesCodes = this.countriesCodes.filter((item) =>
            item.native?.toLowerCase()?.includes(search.toLowerCase())
          );
        }
      });
  }
}
