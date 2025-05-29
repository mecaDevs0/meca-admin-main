export interface IWorkshopAgenda {
  sunday: ISunday;
  monday: IMonday;
  tuesday: ITuesday;
  wednesday: IWednesday;
  thursday: IThursday;
  friday: IFriday;
  saturday: ISaturday;
  workshop: IWorkshop;
  dataBlocked: any;
  disabled: any;
  created: number;
  id: string;
}

export interface ISunday {
  open: boolean;
  startTime: string;
  closingTime: string;
  startOfBreak: string;
  endOfBreak: string;
}

export interface IMonday {
  open: boolean;
  startTime: string;
  closingTime: string;
  startOfBreak: string;
  endOfBreak: string;
}

export interface ITuesday {
  open: boolean;
  startTime: string;
  closingTime: string;
  startOfBreak: string;
  endOfBreak: string;
}

export interface IWednesday {
  open: boolean;
  startTime: string;
  closingTime: string;
  startOfBreak: string;
  endOfBreak: string;
}

export interface IThursday {
  open: boolean;
  startTime: string;
  closingTime: string;
  startOfBreak: string;
  endOfBreak: string;
}

export interface IFriday {
  open: boolean;
  startTime: string;
  closingTime: string;
  startOfBreak: string;
  endOfBreak: string;
}

export interface ISaturday {
  open: boolean;
  startTime: string;
  closingTime: string;
  startOfBreak: string;
  endOfBreak: string;
}

export interface IWorkshop {
  id: string;
  fullName: string;
  companyName: any;
  phone: any;
  cnpj: any;
  zipCode: any;
  streetAddress: any;
  number: any;
  cityName: any;
  cityId: any;
  stateName: any;
  stateUf: any;
  stateId: any;
  neighborhood: any;
  complement: any;
  latitude: number;
  longitude: number;
}
