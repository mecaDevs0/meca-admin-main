import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { LoginComponent } from './components/login/login.component';
import { RecoverPasswordComponent } from './components/recover-password/recover-password.component';
import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

@NgModule({
  declarations: [
    PublicComponent,
    LoginComponent,
    RecoverPasswordComponent,
    AccessDeniedComponent,
  ],
  imports: [PublicRoutingModule, SharedModule],
})
export class PublicModule {}
