import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GlobalClass } from '@app/core/classes/global.class';
import { dateToSeconds } from '@app/core/functions/date.function';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IProfile } from '@app/core/interfaces/IProfile';
import { EProfileNotificationsType } from '@app/core/enums/EProfileNotificationsType';
import { enumToList } from '@app/core/functions/enumToList';
import { trimWhiteSpace } from '../../../../../core/functions/validators.function';
import { IWorkshop } from '@app/core/interfaces/IWorkshop';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService extends GlobalClass<IProfile | IWorkshop> {
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
      {
        data: 'fullName',
        name: 'FullName',
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

  accessLevelName: EMenuItem = EMenuItem['Notificações'];
  uri: string = 'Notification';
  actionsMsg: string = 'esta notificação';

  baseRoute: string = '/app/notification';
  listTitle: string = `Todas as notificações`;
  detailsTitle: string = 'da notificação';
  breadCrumbTitle: string = 'Notificações';
  breadCrumbSubtitleTitle: string = 'notificação';

  profiles = enumToList(EProfileNotificationsType);

  configModalNotification: any = {
    open: false,
  };
  totalNotifications: number = 0;

  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
      profile: [EProfileNotificationsType.Clientes],
    });

    this.listenFilter();
  }

  listenFilter() {
    this.subscriptions.push(
      this.listSearchForm.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((value: any) => {
          if (value.profile != null) {
            this.getListProfiles(value.profile as EProfileNotificationsType);
          }

          if (value.startDate) {
            value.startDate = dateToSeconds(value.startDate);
          }

          if (value.endDate) {
            value.endDate = dateToSeconds(value.endDate);
          }

          this.handleListSearchChange(value);
        })
    );
  }

  loadForm() {
    this.formData = null;
    this.form = this.fb.group({
      id: [null],
      title: [
        null,
        [trimWhiteSpace, Validators.required, Validators.maxLength(50)],
      ],
      content: [
        null,
        [trimWhiteSpace, Validators.required, Validators.maxLength(150)],
      ],
      targetId: [[]],
      typeProfile: [EProfileNotificationsType.Clientes],
    });

    this.patchValuesForm();
    this.configModalNotification = {
      open: false,
    };
  }

  openModalNotification() {
    this.configModalNotification = {
      open: true,
      width: '800px',
      height: '600px',
      title: 'Enviar notificação',
    };
  }

  getListProfiles(profile: EProfileNotificationsType): any {
    this.uri =
      profile == EProfileNotificationsType['Clientes'] ? 'Profile' : 'Workshop';
    this.form?.get('typeProfile')?.setValue(profile);
  }

  handleSubmit(): void {
    if (this.formLoading === false) {
      this.formLoading = true;
      if (this.form.valid) {
        this.formErrors = false;
        this.form.value.targetId = this.listSelected.map((item) => item.id);
        this.store(this.form.value);
      } else {
        this.validateAllFormFields(this.form);
        this.formLoading = false;
        this.formErrors = true;
      }
    }
  }

  store(body: any, route?: string | undefined): void {
    this.formLoading = true;
    this.httpService.post(`Notification/Send`, body, true).subscribe(
      (_) => {
        this.reset();
        this.formLoading = false;
        this.configModalNotification = {};
        this.listSelected = [];
        this.form
          .get('typeProfile')
          ?.setValue(this.listSearchForm.value?.profile);
      },
      (_) => {
        this.formLoading = false;
      }
    );
  }
}
