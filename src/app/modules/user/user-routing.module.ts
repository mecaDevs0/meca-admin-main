import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UserLoginComponent } from './containers/user-login/user-login.component';
import { UserHomeComponent } from './containers/user-home/user-home.component';
import { UserAuthGuard } from '@app/core/guards/auth/user-auth.guard';
import { UserRecoverPasswordComponent } from './containers/user-recover-password/user-recover-password.component';

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      { path: 'login', component: UserLoginComponent },
      { path: 'recover-password', component: UserRecoverPasswordComponent },
      {
        path: 'home',
        component: UserHomeComponent,
        canActivate: [UserAuthGuard],
      },
      { path: '', redirectTo: '/user/login', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
