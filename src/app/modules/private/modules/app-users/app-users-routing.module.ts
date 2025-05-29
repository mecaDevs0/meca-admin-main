import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppUsersComponent } from './app-users.component';
import { AppUsersDetailsPageComponent } from './containers/app-users-details-page/app-users-details-page.component';
import { AppUsersReadPageComponent } from './containers/app-users-read-page/app-users-read-page.component';

const routes: Routes = [
  {
    path: '',
    component: AppUsersComponent,
    children: [
      { path: '', component: AppUsersReadPageComponent },
      { path: 'view/:id', component: AppUsersDetailsPageComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppUsersRoutingModule { }
