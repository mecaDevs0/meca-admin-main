import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import moment from 'moment';

export const validateArray = (control: FormControl) => {
  if (control.value?.length === 0) {
    return {
      requiredArray: true,
    };
  }
  return null;
};

export const trimWhiteSpace = (control: FormControl): Validators => {
  let value = control.value;
  if (typeof value === 'string') {
    if (/^\s/.test(value)) {
      value = value.trim();
      control.setValue(value);
    }
    if (/\s{2}/.test(value)) {
      value = value.trim() + ' ';
      control?.setValue(value);
    }
  }
  return false;
};

export const isCpfValid = (control: FormControl): null | Validators => {
  const cpf = control.value;
  if (cpf) {
    let numbers;
    let digits;
    let sum;
    let i;
    let result;
    let equalDigits;
    equalDigits = 1;
    if (cpf.length < 11) {
      return null;
    }
    for (i = 0; i < cpf.length - 1; i++) {
      if (cpf.charAt(i) !== cpf.charAt(i + 1)) {
        equalDigits = 0;
        break;
      }
    }
    if (!equalDigits) {
      numbers = cpf.substring(0, 9);
      digits = cpf.substring(9);
      sum = 0;
      for (i = 10; i > 1; i--) {
        sum += numbers.charAt(10 - i) * i;
      }
      result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== Number(digits.charAt(0))) {
        return {
          cpf: true,
        };
      }
      numbers = cpf.substring(0, 10);
      sum = 0;
      for (i = 11; i > 1; i--) {
        sum += numbers.charAt(11 - i) * i;
      }
      result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== Number(digits.charAt(1))) {
        return {
          cpf: true,
        };
      }
      return null;
    } else {
      return {
        cpf: true,
      };
    }
  }
  return null;
};

export const isCnpjValid = (control: FormControl): null | Validators => {
  const cnpj = control.value ? control.value : '';

  if (cnpj === '') {
    return null;
  }
  if (cnpj.length !== 14) {
    return null;
  }
  // Elimina CNPJs invalidos conhecidos
  if (
    cnpj === '00000000000000' ||
    cnpj === '11111111111111' ||
    cnpj === '22222222222222' ||
    cnpj === '33333333333333' ||
    cnpj === '44444444444444' ||
    cnpj === '55555555555555' ||
    cnpj === '66666666666666' ||
    cnpj === '77777777777777' ||
    cnpj === '88888888888888' ||
    cnpj === '99999999999999'
  ) {
    return { cnpj: true };
  }
  // Valida DVs
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== digitos.charAt(0)) {
    return { cnpj: true };
  }
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== digitos.charAt(1)) {
    return { cnpj: true };
  }
  return null;
};

// Validador de data
export const dateValidator = (
  control: FormControl
): null | ValidationErrors => {
  if (control.value) {
    const dateDue = moment(control.value, 'YYYY-MM-DD');
    const today = moment().startOf('day');
    const days = dateDue.diff(today, 'days');
    return days >= 0 ? null : { dateError: true };
  }
  return null;
};

// Validador para verificar se a data não é antes de hoje
export const isDateBeforeTodayValid = (
  control: AbstractControl
): ValidationErrors | null => {
  const date = control.value;
  if (date && typeof date === 'string') {
    const dateObject = moment(date, 'YYYY-MM-DD');
    const today = moment().startOf('day');
    return dateObject.isSameOrAfter(today)
      ? null
      : { isDateBeforeTomorrowError: true };
  }
  return null;
};

// Validador para verificar se a data não é depois de hoje
export const isDateAfterTodayValid = (
  control: AbstractControl
): ValidationErrors | null => {
  const date = control.value;
  if (date && typeof date === 'string') {
    const dateObject = moment(date, 'YYYY-MM-DD');
    const today = moment().startOf('day');
    return dateObject.isBefore(today)
      ? null
      : { isDateAfterYesterdayValid: true };
  }
  return null;
};

export const wasTermAccepted = (control: FormControl): null | Validators => {
  return control.value !== true ? { term: true } : null;
};

export const requiredMinCheckbox = (min: number = 1) => {
  return (formArray: FormArray): { required: boolean } | null => {
    const totalChecked = formArray.controls
      .map((control) => control.value)
      .reduce((total, current) => (current ? total + 1 : total), 0);

    return totalChecked >= min ? null : { required: true };
  };
};

export const cepValidator = (
  control: FormControl
): { cepInvalid: boolean } | null => {
  const cep = control.value;
  if (cep && cep !== '') {
    const validacep = /^[0-9]{8}$/;
    return validacep.test(cep) ? null : { cepInvalid: true };
  }
  return null;
};

export const equalsTo = (otherField: string) => {
  const validator = (formControl: FormControl) => {
    if (otherField == null) {
      throw new Error('You must enter a field.');
    }
    if (!formControl.root || !(formControl.root as FormGroup).controls) {
      return null;
    }
    const field = (formControl.root as FormGroup).get(otherField);
    if (!field) {
      throw new Error('You must enter a valid field.');
    }
    if (field.value !== formControl.value) {
      return { equalsTo: otherField };
    }
    return null;
  };
  return validator;
};

export const isOver18Validator = (
  control: FormControl
): null | ValidationErrors => {
  if (control.value) {
    const [year, month, day] = control.value.split('/');

    const birthDay = parseInt(day, 10);
    const birthMonth = parseInt(month, 10);
    const birthYear = parseInt(year, 10);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Meses em JavaScript são indexados em 0
    const currentDay = currentDate.getDate();

    // Calculando a idade
    let age = currentYear - birthYear;

    // Verifica se o mês de nascimento ainda não chegou no ano atual
    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      age--;
    }

    // Retorna null se a idade for maior ou igual a 18, ou um erro caso contrário
    return age >= 18 ? null : { underage: true };
  }

  // Se não houver valor no controle, retorna null (ou pode-se adicionar uma validação adicional)
  return null;
};

export const urlValidator = (control: FormControl): null | ValidationErrors => {
  if (control.value) {
    // Expressão regular básica para validar URLs
    const urlPattern =
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\/?([^\s]*)$/;

    return urlPattern.test(control.value) ? null : { urlError: true };
  }
  return null;
};
