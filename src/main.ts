import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { CONFIG_BASE } from './app/core/config';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

function setTitle() {
  const titleEl: HTMLElement = document.getElementById('title') as HTMLElement;
  titleEl.innerText = CONFIG_BASE.appName;
}

setTitle();
