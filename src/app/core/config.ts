import { IConfigBase } from './interfaces/CORE/IConfigBase';

export const CONFIG_BASE: IConfigBase = {
  appName: 'Meca - Admin',
  megaleiosUrl: 'https://api.megaleios.com',
  currentStep: 1,
  withLogFireBaseErrors: false,
  apiUrls: {
    // dev: 'http://localhost:5000',
    dev: 'https://apidev.megaleios.com/ApiMecaDev',
    hml: 'https://apihom.megaleios.com/ApiMecaHml',
    prod: 'https://api-meca.megaleios.com',
  },
  frameworkCall: null,
  agora: {
    AppID: '',
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: 'G-89H62RJ6W3',
    email: 'services@megaleios.com',
    password: 'ru@4kUWhjbp@',
  },
};
