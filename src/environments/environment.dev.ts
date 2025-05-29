import { CONFIG_BASE } from '@core/config';

export const environment = {
  name: 'development',
  production: false,
  url: CONFIG_BASE.apiUrls.dev,
  megaleios: CONFIG_BASE.megaleiosUrl,
  agora: CONFIG_BASE.agora,
  firebase: CONFIG_BASE.firebase,
};
