import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessOfFeaturesGuard } from '@core/guards/access-of-features.guard';
import { AdministratorsComponent } from './administrators.component';
import { AdministratorsCreatePageComponent } from './containers/administrators-create-page/administrators-create-page.component';
import { AdministratorsReadPageComponent } from './containers/administrators-read-page/administrators-read-page.component';
import { AdministratorsUpdatePageComponent } from './containers/administrators-update-page/administrators-update-page.component';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';

const routes: Routes = [
  {
    path: '',
    component: AdministratorsComponent,
    children: [
      { path: '', component: AdministratorsReadPageComponent },
      {
        path: 'add',
        component: AdministratorsCreatePageComponent,
        data: {
          access: EMenuItem['Administradores'],
          feature: EFunctionalities.write,
        },
        canActivate: [AccessOfFeaturesGuard],
      },
      {
        path: ':id',
        component: AdministratorsUpdatePageComponent,
        data: {
          access: EMenuItem['Administradores'],
          feature: EFunctionalities.edit,
        },
        canActivate: [AccessOfFeaturesGuard],
      },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministratorsRoutingModule {}
