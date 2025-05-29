import { IBase } from '../classes/global.class';
import { IAccessLevel } from './CORE/IAccessLevel';

export interface IUserAdministrator extends IBase {
  name: string;
  password: string;
  email: string;
  blocked: boolean;
  accessLevel: IAccessLevel;
  isDefault: boolean;
  commissionFee: number;
  electronicTransfer: string;
  wireTransfer: string;
  sellerCountry: string;
  accountId: string;
  liveKey: string;
  testKey: string;
  userApiKey: string;
  lastRequestVerification: number;
  hasDataBank: boolean;
  lastConfirmDataBank: number;
  accountableName: string;
  accountableCpf: string;
  bankCnpj: string;
  bank: string;
  bankName: string;
  bankAccount: string;
  bankAgency: string;
  typeAccount: number;
  personType: number;
  dataBankStatus: number;
  registrationUrl: string;
  totalSuspectTransaction: number;
  publicKey: string;
  totalNotificationNoRead: number;
  id: string;
}
