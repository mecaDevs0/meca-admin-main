import { CONFIG_BASE } from '@core/config';

export const environment = {
  name: 'homolog',
  production: false,
  url: CONFIG_BASE.apiUrls.hml,
  megaleios: CONFIG_BASE.megaleiosUrl,
  agora: CONFIG_BASE.agora,
  firebase: CONFIG_BASE.firebase,
};
