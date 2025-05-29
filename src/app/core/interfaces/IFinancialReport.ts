import { IBase } from '../classes/global.class';
import { EPaymentMethod } from '../enums/EPaymentMethod';
import { EPaymentStatus } from '../enums/EPaymentStatus';
import { IMerchant } from './IMerchant';
import { IProfile } from './IProfile';

export interface IFinancialReport extends IBase {
  merchant: IMerchant;
  profile: IProfile;
  exchange: number;
  usedExchange: number;
  baseChargeId: string;
  invoice: string;
  description: string;
  typeCharge: number;
  paymentMethod: EPaymentMethod;
  installment: number;
  valuesBrl: IValuesBrl;
  valuesUsd: IValuesUsd;
  urlWebHook: string;
  isExternal: boolean;
  reference: string;
  amount: number;
  qrCode: string | null;
  usdSpread: number;
  feeIsForTheMerchant: boolean;
  iof: number;
  withoutInterest: boolean;
  created: number;
  authCode: string;
  amountReceivable: number;
  codeSale: string;
  paymentStatus: EPaymentStatus;
  qrCodeImage: string;
  paymentVoucher: string;
  aquirerMessage: string;
}

interface IValuesBrl {
  netValue: number;
  platformValue: number;
  grossValue: number;
  gatewayValue: number;
  valuePerInstallment: number;
}

interface IValuesUsd {
  netValue: number;
  platformValue: number;
  grossValue: number;
  gatewayValue: number;
  valuePerInstallment: number;
}
