import { Injectable } from '@angular/core';
import { GlobalClass } from '@classes/global.class';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { ISelect } from '@app/core/interfaces/CORE/ISelect';
import { enumToList } from '@app/core/functions/enumToList';
import { ESchedulingStatus } from '@app/core/enums/ESchedulingStatus';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { ESchedulingStatusTitle } from '@app/core/enums/ESchedulingStatusTitle';
import { ISchedulingHistory } from '@app/core/interfaces/ISchedulingHistory';
import { IWorkshopServices } from '@app/core/interfaces/IWorkshopServices';
import { FormGroup, Validators } from '@angular/forms';
import { IScheduling } from '@app/core/interfaces/Ischeduling';
import { IBudgetServices } from '@app/core/interfaces/IBudgetServices';

export enum EConfirmStatus {
  'approval' = 0,
  'reprove' = 1,
  'partially approve' = 2,
}

@Injectable({
  providedIn: 'root',
})
export class SchedulingService extends GlobalClass<IScheduling> {
  formDataModel: IFormDataModel = {
    columns: [
      {
        data: 'id',
        name: '_id',
        searchable: true,
      },
      {
        data: 'vehicle.plate',
        name: 'Vehicle.Plate',
        searchable: true,
      },
      {
        data: 'profile.fullName',
        name: 'Profile.FullName',
        searchable: true,
      },
      {
        data: 'workshop.companyName',
        name: 'Workshop.CompanyName',
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
    id: [],
    extraSettings: [
      {
        name: 'startDate',
        value: `${moment().hours(0).minutes(0).seconds(0).unix()}`,
      },
      {
        name: 'endDate',
        value: `${moment().hours(23).minutes(59).seconds(59).unix()}`,
      },
    ],
  };

  accessLevelName: EMenuItem = EMenuItem['Solicitações de serviço'];
  uri: string = 'Scheduling';
  baseRoute: string = '/app/scheduling';
  breadCrumbTitle: string = 'Solicitações de serviço';
  listTitle: string = 'Todas as solicitações';
  detailsTitle: string = 'do serviço';
  formData!: IScheduling;
  schedulingStatusOptions: ISelect[] = enumToList(ESchedulingStatus);
  ESchedulingStatus = ESchedulingStatus;
  ESchedulingStatusTitle = ESchedulingStatusTitle;
  formApprovalOrReprove!: FormGroup;
  EConfirmStatus = EConfirmStatus;
  loadingApprovalOrReprove: boolean = false;
  activatedRouteData!: ActivatedRoute;

  schedulingHistory: any = {
    scheduling: [],
    budget: [],
    payment: [],
    service: [],
    approval: [],
    finalized: [],
  };

  loadFormApprovalOrReprove(): void {
    this.formApprovalOrReprove = this.fb.group({
      schedulingId: [null, [Validators.required]],
      confirmStatus: [null, [Validators.required]],
      budgetServices: [[]],
    });

    this.formApprovalOrReprove
      .get('confirmStatus')
      ?.valueChanges.subscribe((value: EConfirmStatus) => {
        if (value === EConfirmStatus['partially approve']) {
          this.formApprovalOrReprove
            .get('budgetServices')
            ?.setValidators([Validators.required]);
          this.formApprovalOrReprove
            .get('budgetServices')
            ?.updateValueAndValidity();
        } else {
          this.formApprovalOrReprove.get('budgetServices')?.clearValidators();
          this.formApprovalOrReprove
            .get('budgetServices')
            ?.updateValueAndValidity();
        }
      });
  }

  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
      status: [''],
      startDate: [moment().hours(0).minutes(0).seconds(0).format('YYYY-MM-DD')],
      endDate: [
        moment().hours(23).minutes(59).seconds(59).format('YYYY-MM-DD'),
      ],
    });

    this.listenFilter();
  }

  getItem(activatedRoute: ActivatedRoute): void {
    this.detailsLoading = true;
    this.activatedRouteData = activatedRoute;
    this.loadForm();
    const id = activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.httpService.get(`${this.uri}/${id}`).subscribe(({ data }) => {
        this.formData = data;
        this.patchValuesForm();
        this.getHistory(activatedRoute);
        this.formApprovalOrReprove.get(`schedulingId`)?.setValue(data.id);
        this.detailsLoading = false;
      });
    }
  }

  getHistory(activatedRoute: ActivatedRoute): void {
    const id = activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.httpService
        .get(`SchedulingHistory?SchedulingId=${id}&Limit=0`)
        .subscribe(({ data }) => {
          this.schedulingHistory.scheduling = data.filter(
            (x: ISchedulingHistory) =>
              x.statusTitle == ESchedulingStatusTitle.Agendamento
          );
          this.schedulingHistory.budget = data.filter(
            (x: ISchedulingHistory) =>
              x.statusTitle == ESchedulingStatusTitle.Orçamento
          );
          this.schedulingHistory.payment = data.filter(
            (x: ISchedulingHistory) =>
              x.statusTitle == ESchedulingStatusTitle.Pagamento
          );
          this.schedulingHistory.service = data.filter(
            (x: ISchedulingHistory) =>
              x.statusTitle == ESchedulingStatusTitle.Serviço
          );
          this.schedulingHistory.approval = data.filter(
            (x: ISchedulingHistory) =>
              x.statusTitle == ESchedulingStatusTitle.Aprovação
          );
          this.schedulingHistory.finalized = data.filter(
            (x: ISchedulingHistory) =>
              x.statusTitle == ESchedulingStatusTitle.Concluído
          );
        });
    }
  }

  handleTotalValue(data: IBudgetServices[]): number {
    return data.reduce((total, x) => total + (x.value || 0), 0);
  }

  handleApproveOrReproveDispute(): void {
    if (this.formApprovalOrReprove.valid) {
      this.loadingApprovalOrReprove = true;

      const data = this.formApprovalOrReprove.value;

      if (data.confirmStatus === EConfirmStatus.approval) {
        data.budgetServices = this.formData.budgetServices;
      }

      if (data.confirmStatus === EConfirmStatus['partially approve']) {
        data.confirmStatus = EConfirmStatus.approval;
      }

      this.httpService
        .post(`${this.uri}/ApproveOrReproveService`, data, true)
        .subscribe(
          ({ data }) => {
            this.getItem(this.activatedRouteData);
            this.loadingApprovalOrReprove = false;
          },
          (err) => {
            this.loadingApprovalOrReprove = false;
          }
        );
    } else {
      this.validateAllFormFields(this.formApprovalOrReprove);
    }
  }
}
