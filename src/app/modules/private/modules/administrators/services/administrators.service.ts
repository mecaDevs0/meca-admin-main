import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IAccessLevel } from '@app/core/interfaces/CORE/IAccessLevel';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { IUserAdministrator } from '@app/core/interfaces/IUserAdministrator';
import { GlobalClass } from '@classes/global.class';
import { trimWhiteSpace } from '@functions/validators.function';

@Injectable({
  providedIn: 'root',
})
export class AdministratorsService extends GlobalClass<IUserAdministrator> {
  formDataModel: IFormDataModel = {
    columns: [
      {
        data: 'id',
        name: '_id',
        searchable: true,
      },
      {
        data: 'name',
        name: 'Name',
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

  accessLevelName: EMenuItem = EMenuItem['Administradores'];
  uri: string = 'UserAdministrator';
  actionsMsg: string = 'este administrador';
  baseRoute: string = '/app/administrators';
  listTitle: string = `Todos os administradores`;
  breadCrumbTitle: string = 'Administradores';
  breadCrumbSubtitle: string = 'administrador';

  accessLevels: IAccessLevel[] = [];

  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
      accessLevelId: [''],
    });

    this.listenFilter();
  }

  loadForm() {
    this.restartForm();
    this.form = this.fb.group({
      id: [null],
      name: [null, [trimWhiteSpace, Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      accessLevel: [null, [Validators.required]],
    });

    this.patchValuesForm();
    this.getAccessLevel();
  }

  getAccessLevel() {
    this.httpService
      .get(`AccessLevel?Limit=0&DataBlocked=0`)
      .subscribe(({ data }) => (this.accessLevels = data));
  }

  handleDelete = async (item: IUserAdministrator) => {
    const confirm = await this.alertService.alert(
      `Excluir ${this.actionsMsg}?`
    );
    if (confirm) {
      this.httpService
        .post(`${this.uri}/Delete`, { id: item?.id }, true)
        .subscribe(() => this.getList());
    }
  };

  getItem(activatedRoute: ActivatedRoute): void {
    this.detailsLoading = true;
    this.loadForm();
    const id = activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.httpService.get(`${this.uri}/Detail/${id}`).subscribe(({ data }) => {
        this.formData = data;
        this.patchValuesForm();
        this.detailsLoading = false;
      });
    }
  }

  async handleBlockUnblock(event: Event, index: number): Promise<void> {
    event.preventDefault();
    const target = event?.target as HTMLInputElement;
    const { value: id, checked } = target;

    const dataBlocked = checked ? false : true;
    const msg = dataBlocked ? 'desativar' : 'ativar';
    const toBlock = dataBlocked ? true : false;

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
          } else if (this.formData?.blocked) {
            this.formData['blocked'] = toBlock;
          }
        });
    }
  }
}
