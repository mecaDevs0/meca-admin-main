import { IProfile } from './IProfile';
import { IVehicle } from './IVehicle';
import { IWorkshop } from './IWorkshop';

export interface IRating {
  attendanceQuality: number;
  serviceQuality: number;
  costBenefit: number;
  observations: string;
  schedulingId: string;
  profile: IProfile;
  workshopService: any;
  workshop: IWorkshop;
  vehicle: IVehicle;
  ratingAverage: number;
  dataBlocked: any;
  disabled: any;
  created: number;
  id: string;
}
