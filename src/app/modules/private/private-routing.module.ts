import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuItemsGuard } from '@core/guards/menu-items.guard';
import { PrivateComponent } from './private.component';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { EMenuItem } from '@app/core/enums/EMenuItem';

const routes: Routes = [
  {
    canLoad: [AuthGuard],
    path: '',
    component: PrivateComponent,
    children: [
      {
        path: 'profile',
        loadChildren: () =>
          import('./modules/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./modules/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
        data: { access: EMenuItem.Dashboard },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'access-profiles',
        loadChildren: () =>
          import('./modules/access-level/access-level.module').then(
            (m) => m.AccessLevelModule
          ),
        data: { access: EMenuItem['Perfis de acesso'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'administrators',
        loadChildren: () =>
          import('./modules/administrators/administrators.module').then(
            (m) => m.AdministratorsModule
          ),
        data: { access: EMenuItem.Administradores },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'fees',
        loadChildren: () =>
          import('./modules/fees/fees.module').then((m) => m.FeesModule),
        data: { access: EMenuItem.Taxas },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'workshop',
        loadChildren: () =>
          import('./modules/workshop/workshop.module').then(
            (m) => m.WorkshopModule
          ),
        data: { access: EMenuItem['Oficinas'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'app-users',
        loadChildren: () =>
          import('./modules/app-users/app-users.module').then(
            (m) => m.AppUsersModule
          ),
        data: { access: EMenuItem['Lista de clientes'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'financial-report',
        loadChildren: () =>
          import('./modules/financial-report/financial-report.module').then(
            (m) => m.FinancialReportModule
          ),
        data: { access: EMenuItem['Relatório Financeiro'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./modules/notifications/notifications.module').then(
            (m) => m.NotificationsModule
          ),
        data: { access: EMenuItem['Notificações'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'rating',
        loadChildren: () =>
          import('./modules/rating/rating.module').then((m) => m.RatingModule),
        data: { access: EMenuItem['Avaliações'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./modules/workshop-services/workshop-services.module').then(
            (m) => m.WorkshopServicesModule
          ),
        data: { access: EMenuItem['Serviços'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
      {
        path: 'scheduling',
        loadChildren: () =>
          import('./modules/scheduling/scheduling.module').then(
            (m) => m.SchedulingModule
          ),
        data: { access: EMenuItem['Solicitações de serviço'] },
        canActivate: [AuthGuard, MenuItemsGuard],
      },
    ],
  },
  { path: '', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateRoutingModule {}
