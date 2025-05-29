import { Component, Input, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MegaleiosService } from '../../../../core/services/megaleios/megaleios.service';
import { IBank } from '@app/core/interfaces/CORE/IBank';

@Component({
  selector: 'app-bank-data',
  templateUrl: './bank-data.component.html',
  styleUrls: ['./bank-data.component.scss'],
})
export class BankDataComponent {
  @Input() form!: FormGroup;
  banks: IBank[] = [];
  accountMask: string = '';
  agencyMask: string = '';

  constructor(private megaleiosService: MegaleiosService) {}

  ngOnChanges(simpleChanges: SimpleChanges): void {
    this.getIuguBanks();
    this.addEventsForm();
  }

  getIuguBanks(): void {
    this.megaleiosService
      .getIuguBanks()
      .subscribe(({ data }) => (this.banks = data as IBank[]));
  }

  addEventsForm(): void {
    // Tratamento do tipo de conta PF ou PJ para habilitar/desabilitar o CNPJ
    this.form?.get('personType')?.valueChanges.subscribe((personType) => {
      if (personType === 1) {
        this.form.get('bankCnpj')?.disable();
      } else {
        this.form.get('bankCnpj')?.enable();
      }
    });

    // tratamento das máscaras da agência e conta de acordo com o nome do banco selecionado
    this.form?.get('bankName')?.valueChanges.subscribe((bankName: string) => {
      if (bankName) {
        const bank = this.banks.find((b) => b.name == bankName);
        if (bank) {
          this.form.patchValue({ bank: bank.code });
          const regex = /9|D|X/gi;
          this.accountMask = bank.accountMask.replace(regex, '0');
          this.agencyMask = bank.agencyMask.replace(regex, '0');
        }
      }
    });
  }

  resetAccountAndAgency(): void {
    this.form.get('bankAccount')?.reset();
    this.form.get('bankAgency')?.reset();
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

    return this.form.get(field)?.touched && this.form?.get(field)?.invalid
      ? true
      : false;
  };
}
