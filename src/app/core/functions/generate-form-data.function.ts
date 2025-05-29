import { IExtraSettings } from '../interfaces/CORE/IExtraSettings';
import { IColumn, IFormDataModel } from '../interfaces/CORE/IFormDataModel';

export function generateFormData(formDataModel: IFormDataModel): FormData {
  const formData = new FormData();

  // Extra settings
  if (formDataModel?.extraSettings?.length) {
    formDataModel?.extraSettings.forEach((el: IExtraSettings) => {
      formData.set(`${el?.name}`, el?.value);
    });
  }

  // ID's
  formDataModel?.id?.forEach((el: string, index: number) => {
    formData.set(`id[${index}]`, el);
  });

  // properties
  formDataModel.columns.forEach((item: IColumn, index: number) => {
    for (const prop in item) {
      if (item.hasOwnProperty(prop)) {
        formData.set(
          `columns[${index}][${prop}]`,
          item[prop] !== null ? String(item[prop]) : ''
        );
      }
    }
  });

  // page and limit
  formData.set(
    'start',
    ((formDataModel.page - 1) * formDataModel.pageSize).toString()
  );
  formData.set('length', formDataModel.pageSize.toString());

  // order
  let columnIndex = '';
  let i = 0;
  while (columnIndex === '' && i < formDataModel.columns.length) {
    if (formDataModel.order.column === formDataModel.columns[i].data) {
      columnIndex = i.toString();
    }
    i++;
  }
  formData.set('order[0][column]', columnIndex ? columnIndex : '0');
  formData.set('order[0][dir]', formDataModel.order.direction);

  // search
  if (formDataModel.search) {
    for (const prop in formDataModel.search) {
      if (formDataModel.search.hasOwnProperty(prop)) {
        prop === 'search'
          ? formData.set('search[value]', String(formDataModel.search[prop]))
          : formData.set(prop, String(formDataModel.search[prop]));
      }
    }
  }

  return formData;
}
