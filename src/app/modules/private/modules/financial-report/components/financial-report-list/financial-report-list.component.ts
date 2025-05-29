import { Component, Input } from '@angular/core';
import { FinancialReportService } from '../../services/financial-report.service';

@Component({
  selector: 'app-financial-report-list',
  templateUrl: './financial-report-list.component.html',
  styleUrls: ['./financial-report-list.component.scss'],
})
export class FinancialReportListComponent {
  @Input() controller!: FinancialReportService;
}
