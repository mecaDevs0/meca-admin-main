import { IWorkshop } from './IWorkshop';

export interface INotification {
  schedulingId: string;
  workshop: IWorkshop;
  id: string;
  title: string;
  content: string;
  targetId: string[];
  typeProfile: number;
  route: number;
  created: number;
}
