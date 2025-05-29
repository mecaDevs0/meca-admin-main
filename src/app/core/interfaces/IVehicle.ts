import { IBase } from '../classes/global.class';
import { IProfile } from './IProfile';

export interface IVehicle extends IBase {
  plate: string;
  manufacturer: string;
  model: string;
  km: number;
  color: string;
  year: string;
  lastRevisionDate: number;
  profile: IProfile;
  created: number;
  id: string;
}
