import { IBase } from '../classes/global.class';

export interface IProfile extends IBase {
  cpf: string;
  password: string;
  providerId: string;
  typeProvider: number;
  fullName: string;
  email: string;
  phone: string;
  blocked: boolean;
  documentPhoto: string;
  typeDocument: number;
  driveLicenseOrPassportNumber: string;
  zipCode: string;
  streetAddress: string;
  number: string;
  cityName: string;
  cityId: string;
  stateName: string;
  stateUf: string;
  stateId: string;
  neighborhood: string;
  complement: string;
  totalNotificationNoRead: number;
  bettelerStatus: number;
  dataBlocked: number;
  disabled: number;
  created: number;
  id: string;
  photo: string;
  birthDate: number;
  [key: string]: string | number | boolean;
}
