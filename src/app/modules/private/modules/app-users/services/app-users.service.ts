import { GlobalClass } from '@classes/global.class';
import { Injectable } from '@angular/core';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { ActivatedRoute } from '@angular/router';
import { IProfile } from '@app/core/interfaces/IProfile';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { IVehicle } from '@app/core/interfaces/IVehicle';

@Injectable({
  providedIn: 'root',
})
export class AppUsersService extends GlobalClass<IProfile> {
  formDataModel: IFormDataModel = {
    columns: [
      {
        data: 'id',
        name: '_id',
        searchable: true,
      },
      {
        data: 'fullName',
        name: 'FullName',
        searchable: true,
      },
      {
        data: 'email',
        name: 'Email',
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

  accessLevelName: EMenuItem = EMenuItem['Lista de clientes'];
  uri: string = 'Profile';
  actionsMsg: string = 'este cliente';
  baseRoute: string = '/app/app-users';
  listTitle: string = `Todos os clientes`;
  detailsTitle: string = 'do cliente';
  breadCrumbTitle: string = 'Lista de clientes';
  breadCrumbSubtitle: string = 'cliente';
  formData!: IProfile;
  vehicles: IVehicle[] = [];

  getItem(activatedRoute: ActivatedRoute): void {
    this.detailsLoading = true;
    this.loadForm();
    const id = activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.httpService.get(`${this.uri}/Detail/${id}`).subscribe(({ data }) => {
        this.formData = data;
        this.patchValuesForm();
        this.getVehiclesByUser();
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
          `${this.uri}/BlockUnblock`,
          { targetId: id, block: toBlock ? true : false },
          true
        )
        .subscribe(() => {
          if (index >= 0) {
            this.list[index]['blocked'] = toBlock;
          } else {
            this.formData['blocked'] = toBlock;
          }
        });
    }
  }

  getVehiclesByUser() {
    this.httpService
      .get(`Vehicle?ProfileId=${this.formData.id}&Limit=0&DataBlocked=0`)
      .subscribe(({ data }) => {
        this.vehicles = data;
      });
  }
}
