import { CONFIG_BASE } from '@core/config';

export const environment = {
  name: 'production',
  production: true,
  url: CONFIG_BASE.apiUrls.prod,
  megaleios: CONFIG_BASE.megaleiosUrl,
  agora: CONFIG_BASE.agora,
  firebase: CONFIG_BASE.firebase,
};
