import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Containers
import { ProfileComponent } from './profile.component';
import { ProfileReadPageComponent } from './containers/profile-read-page/profile-read-page.component';
import { ProfileUpdatePageComponent } from './containers/profile-update-page/profile-update-page.component';
import { ProfilePasswordUpdatePageComponent } from './containers/profile-password-update-page/profile-password-update-page.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      { path: 'list', component: ProfileReadPageComponent },
      { path: 'edit/:id', component: ProfileUpdatePageComponent },
      { path: 'password', component: ProfilePasswordUpdatePageComponent },
      { path: "**", redirectTo: "", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
