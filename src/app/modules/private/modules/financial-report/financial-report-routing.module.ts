import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancialReportReadPageComponent } from './containers/financial-report-read-page/financial-report-read-page.component';
import { FinancialReportComponent } from './financial-report.component';
import { FinancialReportDetailsPageComponent } from './containers/financial-report-details-page/financial-report-details-page.component';

const routes: Routes = [
  {
    path: '',
    component: FinancialReportComponent,
    children: [
      { path: '', component: FinancialReportReadPageComponent },
      { path: 'view/:id', component: FinancialReportDetailsPageComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialReportRoutingModule { }
