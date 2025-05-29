import { IServiceDefault } from './IServiceDefault';
import { IWorkshop } from './IWorkshop';

export interface IWorkshopServices {
  service: IServiceDefault;
  estimatedTime: string;
  workshop: IWorkshop;
  quickService: boolean;
  minTimeScheduling: string;
  description: string;
  photo: string;
  dataBlocked: any;
  disabled: any;
  created: any;
  id: string;
}
