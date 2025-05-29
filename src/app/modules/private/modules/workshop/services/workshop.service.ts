import { Injectable } from '@angular/core';
import { GlobalClass } from '@classes/global.class';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IDataBank, IWorkshop } from '@app/core/interfaces/IWorkshop';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { enumToList } from '@app/core/functions/enumToList';
import { EWorkshopStatus } from '@app/core/enums/EWorkshopStatus';
import { ISelect } from '@app/core/interfaces/CORE/ISelect';
import { IWorkshopServices } from '@app/core/interfaces/IWorkshopServices';
import { IWorkshopAgenda } from '@app/core/interfaces/IWorkshopAgenda';

@Injectable({
  providedIn: 'root',
})
export class WorkshopService extends GlobalClass<IWorkshop> {
  formDataModel: IFormDataModel = {
    columns: [
      {
        data: 'id',
        name: '_id',
        searchable: true,
      },
      {
        data: 'companyName',
        name: 'CompanyName',
        searchable: true,
      },
      {
        data: 'cnpj',
        name: 'cnpj',
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
    extraSettings: [],
  };

  accessLevelName: EMenuItem = EMenuItem['Oficinas'];
  uri: string = 'Workshop';
  baseRoute: string = '/app/workshop';
  breadCrumbTitle: string = 'Oficinas';
  listTitle: string = 'Todas as oficinas';
  actionsMsg: string = 'essa oficina';
  detailsTitle: string = 'da Oficina';
  workshopStatusList: ISelect[] = enumToList(EWorkshopStatus);
  formData!: IWorkshop;
  approveOrReproveLoading: boolean = false;
  EWorkshopStatus = EWorkshopStatus;
  workshopServices: IWorkshopServices[] = [];
  workshopAgenda: IWorkshopAgenda | null = null;

  configViewWorkshopDocument: any = {
    open: false,
    imageScr: '',
    imageName: '',
  };

  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
      status: [''],
    });

    this.listenFilter();
  }

  getItem(activatedRoute: ActivatedRoute): void {
    this.detailsLoading = true;
    this.loadForm();
    const id = activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.httpService
        .get(`${this.uri}/Detail/${id}`)
        .subscribe(async ({ data }) => {
          this.formData = data;
          this.patchValuesForm();
          await this.getDataBank();
          await this.getAgenda();
          await this.getWorkshopServices();
          this.detailsLoading = false;
        });
    }
  }

  async handleBlockUnblock(event: Event, index: number): Promise<void> {
    event.preventDefault();
    const target = event?.target as HTMLInputElement;
    const { value: id, checked } = target;

    const msg = checked ? 'ativar' : 'desativar';
    const toBlock = checked ? false : true;

    const confirm = await this.alertService.alert(
      `Tem certeza que deseja ${msg} ${this.actionsMsg}?`
    );
    if (confirm) {
      this.httpService
        .post(
          `${this.uri}/BlockUnBlock`,
          { targetId: id, block: toBlock ? true : false },
          true
        )
        .subscribe(() => {
          if (index >= 0) {
            this.list[index]['dataBlocked'] = toBlock ? moment().unix() : null;
          } else {
            this.formData['dataBlocked'] = toBlock ? moment().unix() : null;
          }
        });
    }
  }

  async handleApproveOrReprove(status: EWorkshopStatus): Promise<void> {
    const confirm = await this.alertService.alert(
      `Tem certeza que deseja ${
        status === EWorkshopStatus.Aprovada ? 'aprovar' : 'reprovar'
      } essa Oficina?`
    );

    if (confirm) {
      this.approveOrReproveLoading = true;

      const data = {
        status: status,
      };

      this.httpService
        .patch(`${this.uri}/${this.formData.id}`, data, true)
        .subscribe(
          ({ data }) => {
            this.formData.status = status;
            this.approveOrReproveLoading = false;
          },
          (err) => {
            this.approveOrReproveLoading = false;
          }
        );
    }
  }

  getDataBank(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpService
        .get(`Workshop/GetDataBank/${this.formData.id}`)
        .subscribe(
          ({ data }) => {
            this.formData.dataBank = data;
            resolve();
          },
          () => {
            reject();
          }
        );
    });
  }

  getAgenda(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpService.get(`WorkshopAgenda/${this.formData.id}`).subscribe(
        ({ data }) => {
          this.workshopAgenda = data;
          resolve();
        },
        () => {
          reject();
        }
      );
    });
  }

  getWorkshopServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpService
        .get(`WorkshopServices?WorkshopId=${this.formData.id}`)
        .subscribe(
          ({ data }) => {
            this.workshopServices = data;
            resolve();
          },
          () => {
            reject();
          }
        );
    });
  }

  handleConfigViewWorkshopDocument(): void {
    this.configViewWorkshopDocument = {
      open: true,
      imageSrc: this.formData.meiCard,
      imageName: 'Documento da Oficina',
    };
  }
}
