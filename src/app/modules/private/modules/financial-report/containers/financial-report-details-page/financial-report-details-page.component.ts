import { Component } from '@angular/core';
import { FinancialReportService } from '../../services/financial-report.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-financial-report-details-page',
  templateUrl: './financial-report-details-page.component.html',
  styleUrls: ['./financial-report-details-page.component.scss'],
})
export class FinancialReportDetailsPageComponent {
  constructor(
    public controller: FinancialReportService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadForm();
    this.controller.getItem(activatedRoute);
  }
}
