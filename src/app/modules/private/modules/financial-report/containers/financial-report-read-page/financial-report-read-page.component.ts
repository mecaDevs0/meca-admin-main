import { Component } from '@angular/core';
import { FinancialReportService } from '../../services/financial-report.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-financial-report-read-page',
  templateUrl: './financial-report-read-page.component.html',
  styleUrls: ['./financial-report-read-page.component.scss'],
})
export class FinancialReportReadPageComponent {
  constructor(
    public controller: FinancialReportService,
    private activatedRoute: ActivatedRoute
  ) {
    this.controller.loadFilter();
    this.controller.readOnInit(activatedRoute);
  }
}
