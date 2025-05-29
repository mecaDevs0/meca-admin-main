import { INotification } from '../INotification';

export interface INotificationConfig {
  open: boolean;
  notifications: INotification[] | null;
}
