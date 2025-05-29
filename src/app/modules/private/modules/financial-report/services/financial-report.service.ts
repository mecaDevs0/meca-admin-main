import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalClass } from '@app/core/classes/global.class';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { EPaymentMethod } from '@app/core/enums/EPaymentMethod';
import { EPaymentStatus } from '@app/core/enums/EPaymentStatus';
import { enumToList } from '@app/core/functions/enumToList';
import { IFinancialReport } from '@app/core/interfaces/IFinancialReport';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';

@Injectable({
  providedIn: 'root',
})
export class FinancialReportService extends GlobalClass<IFinancialReport> {
  formDataModel: IFormDataModel = {
    columns: [
      {
        data: 'id',
        name: '_id',
        searchable: true,
      },
    ],
    page: 1,
    pageSize: 10,
    search: {
      search: '',
    },
    order: {
      column: '',
      direction: 'desc',
    },
  };

  accessLevelName: EMenuItem = EMenuItem['Relatório Financeiro'];
  uri: string = 'FinancialHistory';
  actionsMsg: string = 'este relatório';
  baseRoute: string = '/app/financial-report';
  listTitle: string = `Todos os relatórios`;
  detailsTitle: string = 'do relatório';
  breadCrumbTitle: string = 'Relatório financeiro';
  breadCrumbSubtitle: string = 'relatório';
  listName: string = 'relatório financeiro';

  paymentStatusList = enumToList(EPaymentStatus);
  paymentMethodList = enumToList(EPaymentMethod);

  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
      paymentStatus: [''],
      paymentMethod: [''],
      startDate: [''],
      endDate: [''],
    });

    this.listenFilter();
  }

  getItem(activatedRoute: ActivatedRoute): void {
    this.detailsLoading = true;
    this.loadForm();
    const id = activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.httpService.get(`${this.uri}/${id}`).subscribe(({ data }) => {
        this.formData = data;
        this.patchValuesForm();
        this.detailsLoading = false;
      });
    }
  }
}
