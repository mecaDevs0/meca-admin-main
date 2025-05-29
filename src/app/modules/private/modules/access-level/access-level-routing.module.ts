import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessOfFeaturesGuard } from '@core/guards/access-of-features.guard';
import { AccessLevelComponent } from './access-level.component';
import { AccessLevelCreatePageComponent } from './container/access-level-create-page/access-level-create-page.component';
import { AccessLevelUpdatePageComponent } from './container/access-level-update-page/access-level-update-page.component';
import { AccessLevelReadPageComponent } from './container/access-level-read-page/access-level-read-page.component';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { EFunctionalities } from '../../../../core/interfaces/CORE/IAsideMenuConfig';

const routes: Routes = [
  {
    path: '',
    component: AccessLevelComponent,
    children: [
      { path: '', component: AccessLevelReadPageComponent },
      {
        path: 'add',
        component: AccessLevelCreatePageComponent,
        data: {
          access: EMenuItem['Perfis de acesso'],
          feature: EFunctionalities.write,
        },
        canActivate: [AccessOfFeaturesGuard],
      },
      {
        path: ':id',
        component: AccessLevelUpdatePageComponent,
        data: {
          access: EMenuItem['Perfis de acesso'],
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
export class AccessLevelRoutingModule {}
