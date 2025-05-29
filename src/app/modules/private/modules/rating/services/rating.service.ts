import { Injectable } from '@angular/core';
import { GlobalClass } from '@app/core/classes/global.class';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { IRating } from '@app/core/interfaces/IRating';

@Injectable({
  providedIn: 'root',
})
export class RatingService extends GlobalClass<IRating> {
  formDataModel: IFormDataModel = {
    columns: [
      {
        data: 'id',
        name: '_id',
        searchable: true,
      },
      {
        data: 'title',
        name: 'Title',
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

  accessLevelName: EMenuItem = EMenuItem['Avaliações'];
  uri: string = 'Rating';
  baseRoute: string = '/app/rating';
  listTitle: string = `Todas as avaliações`;
  breadCrumbTitle: string = 'Avaliações';
}
