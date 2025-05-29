import { Component, Input } from '@angular/core';
import { FinancialReportService } from '../../services/financial-report.service';

@Component({
  selector: 'app-financial-report-filter',
  templateUrl: './financial-report-filter.component.html',
  styleUrls: ['./financial-report-filter.component.scss'],
})
export class FinancialReportFilterComponent {
  @Input() controller!: FinancialReportService;
}
