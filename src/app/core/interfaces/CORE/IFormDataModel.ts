import { IExtraSettings } from './IExtraSettings';

export interface IFormDataModel {
  columns: IColumn[];
  page: number;
  pageSize: number;
  search: {
    [key: string]: string | number;
  };
  order: IOrder;
  id?: string[];
  extraSettings?: IExtraSettings[];
  [key: string]:
    | string
    | string[]
    | number
    | number[]
    | IOrder
    | IColumn[]
    | IExtraSettings[]
    | {
        [key: string]: string | number;
      }
    | undefined;
}

export interface IColumn {
  data: string;
  name: string;
  searchable: boolean;
  [key: string]: string | boolean;
}

interface IOrder {
  column: string;
  direction: string;
}
