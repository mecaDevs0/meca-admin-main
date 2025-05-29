import { Injectable } from '@angular/core';
import { GlobalClass } from '@classes/global.class';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { Validators } from '@angular/forms';
import { trimWhiteSpace } from '@functions/validators.function';
import { IServiceDefault } from '@app/core/interfaces/IServiceDefault';

@Injectable({
  providedIn: 'root',
})
export class WorkshopServicesService extends GlobalClass<IServiceDefault> {
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
    ],
    page: 1,
    pageSize: 10,
    search: {
      search: '',
    },
    order: {
      column: 'name',
      direction: 'asc',
    },
    id: [],
    extraSettings: [],
  };

  accessLevelName: EMenuItem = EMenuItem['Serviços'];
  uri: string = 'ServicesDefault';
  listTitle: string = 'Todos os serviços';
  baseRoute: string = '/app/services';
  breadCrumbTitle: string = 'Serviços';
  detailsTitle: string = 'do serviço';
  formData!: IServiceDefault;

  loadForm() {
    this.restartForm();
    this.form = this.fb.group({
      id: [null],
      photo: [null],
      name: [null, [trimWhiteSpace, Validators.required]],
      quickService: [false, [Validators.required]],
      minTimeScheduling: [null, [Validators.required]],
      description: [null, [trimWhiteSpace, Validators.required]],
    });

    this.patchValuesForm();
  }
}
