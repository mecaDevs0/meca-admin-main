import { Component, Input } from '@angular/core';
import { EPaymentMethod } from '@app/core/enums/EPaymentMethod';
import Swal from 'sweetalert2';
import { FinancialReportService } from '../../services/financial-report.service';

@Component({
  selector: 'app-financial-report-details',
  templateUrl: './financial-report-details.component.html',
  styleUrls: ['./financial-report-details.component.scss'],
})
export class FinancialReportDetailsComponent {
  @Input() controller!: FinancialReportService;
  EPaymentMethod = EPaymentMethod;

  copyQrCodeToClipboard() {
    navigator.clipboard.writeText(this.controller.formData?.qrCode || '');
    Swal.fire({
      icon: 'success',
      title: 'Copiado com sucesso!',
      showConfirmButton: false,
      timer: 1500,
    });
  }
}
