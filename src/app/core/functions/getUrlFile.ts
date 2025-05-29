import { environment } from '@environments/environment';

export const getUrlFile = (name: string): string => {
  return `${environment.url}/content/upload/${name}`;
};
