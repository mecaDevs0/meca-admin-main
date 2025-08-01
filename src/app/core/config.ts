import { IConfigBase } from './interfaces/CORE/IConfigBase';

export const CONFIG_BASE: IConfigBase = {
  appName: 'Meca - Admin',
  megaleiosUrl: 'https://api.mecabr.com',
  currentStep: 1,
  withLogFireBaseErrors: false,
  apiUrls: {
    // dev: 'http://localhost:5000',
    dev: 'https://api.mecabr.com',
    hml: 'https://api.mecabr.com',
    prod: 'https://api.mecabr.com',
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
    email: 'contato@mecabr.com',
    password: 'ru@4kUWhjbp@',
  },
};
