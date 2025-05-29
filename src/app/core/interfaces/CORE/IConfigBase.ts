import { EFrameworkCall } from '../../enums/CORE/EFrameworkCall';

export interface IConfigBase {
  appName: string;
  megaleiosUrl: string;
  currentStep: number;
  withLogFireBaseErrors: boolean;
  apiUrls: {
    dev: string;
    hml: string;
    prod: string;
  };
  frameworkCall: EFrameworkCall | null;
  agora: {
    AppID: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
    email: string;
    password: string;
  };
}
