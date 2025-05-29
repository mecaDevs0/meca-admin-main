import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorInterceptor } from './core/interceptors/error/error.interceptor';
import { JsonWebTokenInterceptor } from './core/interceptors/json-web-token/json-web-token.interceptor';
import { SharedModule } from './modules/shared/shared.module';

import localePT from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

import { CONFIG_BASE } from './core/config';
registerLocaleData(localePT);

import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

firebase.initializeApp(CONFIG_BASE.firebase);
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SharedModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ImageCropperModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JsonWebTokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
