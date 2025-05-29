import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserLoginComponent } from './containers/user-login/user-login.component';
import { SharedModule } from '../shared/shared.module';
import { UserComponent } from './user.component';
import { UserHomeComponent } from './containers/user-home/user-home.component';
import { UserRecoverPasswordComponent } from './containers/user-recover-password/user-recover-password.component';

@NgModule({
  declarations: [
    UserComponent,
    UserLoginComponent,
    UserRecoverPasswordComponent,
    UserHomeComponent,
  ],
  imports: [CommonModule, SharedModule, UserRoutingModule],
})
export class UserModule {}
