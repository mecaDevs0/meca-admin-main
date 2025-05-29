import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessOfFeaturesGuard } from '@core/guards/access-of-features.guard';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { EFunctionalities } from '@app/core/interfaces/CORE/IAsideMenuConfig';
import { WorkshopServicesUpdatePageComponent } from './containers/workshop-services-update-page/workshop-services-update-page.component';
import { WorkshopServicesCreatePageComponent } from './containers/workshop-services-create-page/workshop-services-create-page.component';
import { WorkshopServicesReadPageComponent } from './containers/workshop-services-read-page/workshop-services-read-page.component';
import { WorkshopServicesComponent } from './workshop-services.component';
import { WorkshopServicesDetailsPageComponent } from './containers/workshop-services-details-page/workshop-services-details-page.component';

const routes: Routes = [
  {
    path: '',
    component: WorkshopServicesComponent,
    children: [
      { path: '', component: WorkshopServicesReadPageComponent },
      {
        path: 'add',
        component: WorkshopServicesCreatePageComponent,
        data: {
          access: EMenuItem['Serviços'],
          feature: EFunctionalities.write,
        },
        canActivate: [AccessOfFeaturesGuard],
      },
      {
        path: ':id',
        component: WorkshopServicesUpdatePageComponent,
        data: {
          access: EMenuItem['Serviços'],
          feature: EFunctionalities.edit,
        },
        canActivate: [AccessOfFeaturesGuard],
      },
      { path: 'view/:id', component: WorkshopServicesDetailsPageComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkshopServicesRoutingModule {}
