import { ETypeAccount } from '../enums/ETypeAccount';
import { EWorkshopStatus } from '../enums/EWorkshopStatus';

export interface IWorkshop {
  password: string;
  providerId: string;
  typeProvider: number;
  fullName: string;
  companyName: string;
  login: string;
  email: string;
  photo: string;
  meiCard: string;
  cnpj: string;
  phone: string;
  openingHours: string;
  reason: string;
  rating: number;
  distance: number;
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
  latitude: number;
  longitude: number;
  blocked: boolean;
  totalNotificationNoRead: number;
  status: EWorkshopStatus;
  dataBlocked: number | null;
  disabled: number;
  created: number;
  id: string;
  dataBank: IDataBank;
}

export interface IDataBank {
  hasDataBank: boolean;
  accountableName: string;
  accountableCpf: string;
  bankAccount: string;
  bankAgency: string;
  bank: string;
  bankName: string;
  typeAccount: ETypeAccount;
  personType: number;
  bankCnpj: string;
  dataBankStatus: number;
  id: string;
}
