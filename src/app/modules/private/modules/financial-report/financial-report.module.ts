import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinancialReportRoutingModule } from './financial-report-routing.module';
import { FinancialReportComponent } from './financial-report.component';
import { FinancialReportFilterComponent } from './components/financial-report-filter/financial-report-filter.component';
import { FinancialReportListComponent } from './components/financial-report-list/financial-report-list.component';
import { FinancialReportReadPageComponent } from './containers/financial-report-read-page/financial-report-read-page.component';
import { SharedModule } from '../../../shared/shared.module';
import { FinancialReportDetailsComponent } from './components/financial-report-details/financial-report-details.component';
import { FinancialReportDetailsPageComponent } from './containers/financial-report-details-page/financial-report-details-page.component';

@NgModule({
  declarations: [
    FinancialReportComponent,
    FinancialReportFilterComponent,
    FinancialReportListComponent,
    FinancialReportReadPageComponent,
    FinancialReportDetailsComponent,
    FinancialReportDetailsPageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FinancialReportRoutingModule
  ]
})
export class FinancialReportModule { }
