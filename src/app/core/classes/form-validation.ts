interface IConfig {
  required: string;
  email: string;
  cpf: string;
  cnpj: string;
  pattern: string;
  mask: string;
  isDateBeforeTomorrowError: string;
  isDateAfterYesterdayValid: string;
  maxValue: string;
  term: string;
  min: string;
  max: string;
  minlength: string;
  maxlength: string;
  file: string;
  requiredArray: string;
  [key: string]: string;
}

export class FormValidations {
  static getErrorMsg(
    label: string,
    validatorName: string,
    validatorValue?: { max: number; min: number; requiredLength: number }
  ) {
    const config: IConfig = {
      required: 'Por favor, informe esse campo.',
      email: 'Por favor, informe o e-mail no formato: seunome@exemplo.com.',
      cpf: 'Por favor, informe um CPF válido.',
      cnpj: 'Por favor, informe um CNPJ válido.',
      pattern: 'Por favor, informe esse campo no formato correto.',
      mask: 'Por favor, informe esse campo no formato correto.',
      isDateBeforeTomorrowError: 'Por favor, informe uma data válida',
      isDateAfterYesterdayValid: 'Por favor, informe uma data válida',
      maxValue: 'Por favor, informe um valor menor que o valor do boleto.',
      term: 'Por favor, aceite os termos de uso e as políticas de privacidade para continuar.',
      min: `Por favor, informe um valor de no mínimo ${validatorValue?.min}.`,
      max: `Por favor, informe um valor de no máximo ${validatorValue?.max}.`,
      minlength: `Por favor, informe no mínimo ${validatorValue?.requiredLength} caracteres.`,
      maxlength: `Por favor, informe no máximo ${validatorValue?.requiredLength} caracteres.`,
      file: label ?? 'Por favor, selecione um arquivo.',
      requiredArray: `Por favor, selecione ao menos ${label}.`,
      urlError: `Por favor, informe uma url válida.`,
      underage: 'Você precisa ter 18 anos ou mais.',
    };
    return config[validatorName];
  }
}
