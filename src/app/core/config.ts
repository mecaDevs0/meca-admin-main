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
    apiKey: 'AIzaSyDhQU7oEaKQR9QcDQTbdQfxHK2B9LCVj_A',
    authDomain: 'meca-app.firebaseapp.com',
    databaseURL: 'https://meca-app-default-rtdb.firebaseio.com',
    projectId: 'meca-app',
    storageBucket: 'meca-app.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abcdef123456',
    measurementId: 'G-89H62RJ6W3',
    email: 'contato@mecabr.com',
    password: 'ru@4kUWhjbp@',
  },
};
