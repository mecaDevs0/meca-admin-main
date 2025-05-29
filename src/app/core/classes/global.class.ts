import { Directive } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { dateToSeconds, dateNowToSeconds } from '../functions/date.function';
import { generateFormData } from '../functions/generate-form-data.function';
import { HttpService } from '../services/http/http.service';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  UntypedFormGroup,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { StorageService } from '../services/storage/storage.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MegaleiosService } from '../services/megaleios/megaleios.service';
import { SessionService } from '../services/session/session.service';
import { environment } from '@environments/environment';
import { AlertService } from '@app/modules/shared/components/alert/alert.service';
import { AsideMenuService } from '@app/modules/private/components/aside-menu/services/aside-menu.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { IState } from '../interfaces/CORE/IState';
import { ICity } from '../interfaces/CORE/ICity';
import { IListCountry } from '../interfaces/CORE/IListCountry';
import { EButtonsHidden } from '../enums/CRUD/EButtonsHidden';
import { EBlockedName } from '../enums/CRUD/EBlockedName';
import { IGlobalClass } from '../interfaces/CORE/IGlobalClass';
import { EMenuItem } from '../enums/EMenuItem';
import { IFormDataModel } from '../interfaces/CORE/IFormDataModel';

export interface IBase {
  id: string | null;
  dataBlocked?: number | null;
}

@Directive()
export abstract class GlobalClass<T extends IBase> implements IGlobalClass<T> {
  abstract uri: string;
  abstract accessLevelName: EMenuItem | null;

  public formDataModel: IFormDataModel = {
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
    id: [],
    extraSettings: [],
  };

  public subscriptions: Subscription[] = [];
  public form!: FormGroup;
  public listSearchForm!: FormGroup;
  public list: T[] = [];
  public listSelected: T[] = [];
  public states: IState[] = [];
  public cities: ICity[] = [];
  public countries: IListCountry[] = [];
  public formData!: T | null;
  public baseRef: string = `${environment.url}/content/upload/`;
  public actionsMsg: string = 'este item';
  public listName!: string;
  public baseRoute!: string;
  public listTitle: string = 'Todos os registros';
  public detailsTitle: string = 'do item';
  public breadCrumbTitle!: string;
  public breadCrumbSubtitle: string = 'item';
  public listSize: number = 0;
  public listSizeFiltered: number = 0;
  public listLoading: boolean = false;
  public exportLoading: boolean = false;
  public downloadLoading: boolean = false;
  public registerLoading: boolean = false;
  public detailsLoading: boolean = false;
  public formLoading: boolean = false;
  public formErrors: boolean = false;
  public byFilter: boolean = false;
  public EButtonsHidden = EButtonsHidden;
  public EBlockedName = EBlockedName;

  constructor(
    public router: Router,
    public httpService: HttpService<T>,
    public alertService: AlertService,
    public location: Location,
    public fb: FormBuilder,
    public storage: StorageService,
    public session: SessionService,
    public megaleiosService: MegaleiosService,
    public asideMenuService: AsideMenuService,
    public authenticationService: AuthenticationService
  ) {
    // super(router, httpService, alertService ,location, fb, storage, session, megaleiosService, asideMenuService, authenticationService);
  }

  readOnInit(activatedRoute: ActivatedRoute): void {
    activatedRoute.queryParams.subscribe((params: Params) => {
      const paramsList = params;

      if (this.byFilter === true) {
        this.setQueryParams(params);
        return;
      }

      this.listLoading = true;

      if (
        paramsList.hasOwnProperty('search') ||
        paramsList.hasOwnProperty('page')
      ) {
        setTimeout(() => {
          this.setQueryParams(params);
          this.listSearchForm.patchValue(params, { emitEvent: false });
        }, 500);
      } else {
        this.formDataModel.search = {
          search: '',
        };
        this.formDataModel.page = 1;
        this.getList();
      }
    });
  }

  // FILTER
  loadFilter() {
    this.listSearchForm = this.fb.group({
      search: [''],
      startDate: [''],
      endDate: [''],
    });

    this.listenFilter();
  }

  listenFilter() {
    this.formDataModel.search = { search: '' };
    this.subscriptions.push(
      this.listSearchForm.valueChanges
        .pipe(debounceTime(700), distinctUntilChanged())
        .subscribe((value) => {
          this.handleListSearchChange(value);
        })
    );
  }

  updateQueryParams(params: Params): void {
    this.byFilter = true;
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
    setTimeout(() => {
      this.byFilter = false;
    }, 1000);
  }

  handleListSearchChange(value: Params): void {
    this.listSelected = [];
    this.formDataModel.search = value;
    this.formDataModel.page = 1;
    this.updateQueryParams({ ...value, page: 1 });
  }

  handleListOrderChange(value: Params): void {
    this.updateQueryParams(value);
  }

  handleListPageChange(value: Params): void {
    this.updateQueryParams(value);
  }

  // LIST CONTAINER
  async getList(): Promise<void> {
    this.listLoading = true;

    // const id = await this.session.getUserLoggedId();
    // this.formDataModel.extraSettings = [
    //   ...(this.formDataModel.extraSettings || []),
    //   { name: 'merchantId', value: id },
    // ];

    this.listSelected = [];
    this.httpService
      .post(`${this.uri}/LoadData`, generateFormData(this.formDataModel))
      .subscribe({
        next: ({ data, recordsTotal, recordsFiltered }) => {
          this.list = data;
          this.listSize = recordsTotal;
          this.listSizeFiltered = recordsFiltered;
          this.listLoading = false;
          if (!data?.length) {
            this.formDataModel.page = 1;
          }
        },
        error: (_) => {
          this.listLoading = false;
        },
        complete: () => {},
      });
  }

  setQueryParams(params: Params) {
    let searchField = Object.keys(params);

    for (const item of searchField) {
      if (item != 'search') {
        if (this.formDataModel?.hasOwnProperty(item)) {
          this.formDataModel[item] =
            item === 'page' || item === 'pageSize'
              ? Number(params[item])
              : params[item];
        } else if (
          this.formDataModel?.order.hasOwnProperty(item) &&
          (item === 'column' || item === 'direction')
        ) {
          this.formDataModel.order[item] = params[item];
        } else if (item === 'startDate') {
          this.formDataModel.search[item] = dateToSeconds(params[item]) || '';
        } else if (item === 'endDate') {
          this.formDataModel.search[item] =
            dateToSeconds(params[item], true) || '';
        } else {
          this.formDataModel.search[item] = params[item];
        }
      } else {
        this.formDataModel.search[item] = params[item];
      }
    }

    this.getList();
  }

  handleMethodExport = () => {
    if (this.listSelected?.length) {
      this.handleExportItemsSelected();
    } else {
      this.formDataModel.id = [];
      this.exportToExcel();
    }
  };

  handleExportItemsSelected = (item: T | null = null) => {
    if (item !== null) {
      this.listSelected.push(item);
    }

    this.formDataModel.id = this.listSelected.map((el: T) => el.id) as [];
    this.exportToExcel();
  };

  handleDownloadModel = () => {
    this.downloadLoading = true;
    this.httpService
      .download(
        `${this.uri}/ExampleFileImport`,
        generateFormData(this.formDataModel),
        false,
        { responseType: 'blob' }
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,',
          });
          const elRef = document.createElement('a');
          elRef.href = URL.createObjectURL(blob);
          elRef.download = `${this.listName}-modelo.xlsx`;
          elRef.click();
          this.downloadLoading = false;
        },
        (_) => {
          this.downloadLoading = false;
        }
      );
  };

  handleBatchRegistration = (event: Event) => {
    this.registerLoading = true;
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const files: FileList | null = target.files;
    if (files && files[0]) {
      const formData = new FormData();
      formData.append('file', files[0]);
      this.httpService.post(`${this.uri}/FileImport`, formData, true).subscribe(
        (_) => {
          this.getList();
          this.registerLoading = false;
        },
        (_) => (this.registerLoading = false)
      );
    }
  };

  exportToExcel() {
    this.exportLoading = true;
    this.httpService
      .export(`${this.uri}/Export`, generateFormData(this.formDataModel))
      .subscribe(
        (response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,',
          });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `Lista de ${this.listName}.xlsx`;
          a.click();
          this.formDataModel.id = [];
          this.exportLoading = false;
        },
        (_) => {
          this.exportLoading = false;
        }
      );
  }

  // LIST COMPONENT
  handleListItemSelected(value: T) {
    let isSelectedIndex = -1;
    this.listSelected.forEach((item: T, index: number) => {
      if (item === value) {
        isSelectedIndex = index;
      }
    });
    isSelectedIndex === -1
      ? this.listSelected.push(value)
      : this.listSelected.splice(isSelectedIndex, 1);
  }

  async handleBlockUnblock(event: Event, index: number): Promise<void> {
    event.preventDefault();
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const { value: id, checked } = target;

    const dataBlocked = checked ? false : true;
    const msg = dataBlocked ? 'desativar' : 'ativar';
    const date = dataBlocked ? dateNowToSeconds() : null;

    const confirm = await this.alertService.alert(
      `Tem certeza que deseja ${msg} ${this.actionsMsg}?`
    );
    if (confirm) {
      this.httpService
        .patch(`${this.uri}/${id}`, { dataBlocked: date }, true)
        .subscribe(() => {
          if (index >= 0) {
            this.list[index]['dataBlocked'] = date;
          } else {
            this.formData!.dataBlocked = date;
          }
        });
    }
  }

  handleDelete = async (item: T, back: boolean) => {
    const confirm = await this.alertService.alert(
      `Tem certeza que deseja excluir ${this.actionsMsg}?`
    );
    if (confirm) {
      this.httpService.delete(`${this.uri}/${item?.id}`, true).subscribe(() => {
        if (back) {
          this.location.back();
        } else {
          this.getList();
        }
      });
    }
  };

  isChecked(item: T): boolean {
    let isChecked = false;
    let i = 0;
    while (isChecked === false && i < this.listSelected.length) {
      if (JSON.stringify(item) === JSON.stringify(this.listSelected[i])) {
        isChecked = true;
      }
      i++;
    }
    return isChecked;
  }

  handleSelectAll() {
    if (this.listSelected?.length === this.list?.length) {
      this.listSelected = [];
    } else {
      this.list.forEach((item) => {
        const hasItem = this.listSelected.find((el: T) => el.id === item.id);
        if (!hasItem) {
          this.listSelected.push(item);
        }
      });
    }
  }

  // FORM CONTAINER
  loadForm() {
    this.restartForm();
    this.form = this.fb.group({
      id: [null],
    });

    this.patchValuesForm();
  }

  restartForm() {
    this.formData = null;
    this.formErrors = false;
  }

  patchValuesForm(): void {
    if (this.formData) {
      this.form.patchValue(this.formData);
    }
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

  edit(body: T): void {
    this.formLoading = true;
    this.httpService
      .patch(`${this.uri}/${this.form.value.id}`, body, true)
      .subscribe(
        (_) => {
          this.formLoading = false;
          this.location.back();
        },
        (_) => {
          this.formLoading = false;
        }
      );
  }

  store(body: T, route?: string): void {
    this.formLoading = true;
    this.httpService.post(`${this.uri}`, body, true).subscribe(
      (_) => {
        this.formLoading = false;
        this.reset();
        if (route) {
          this.router.navigate([route]);
        } else {
          this.location.back();
        }
      },
      (_) => {
        this.formLoading = false;
      }
    );
  }

  // FORM COMPONENT
  handleSubmit(): void {
    if (this.formLoading === false) {
      if (this.form.valid) {
        this.formErrors = false;
        const data = this.form.value;

        // Manipulação de datas
        if (data?.startDate) data.startDate = dateToSeconds(data.startDate);
        if (data?.endDate) data.endDate = dateToSeconds(data.endDate);

        if (this.formData) {
          this.edit(data);
        } else {
          this.store(data);
        }
      } else {
        this.validateAllFormFields(this.form);
        this.formErrors = true;
      }
    }
  }

  displayFieldCss(
    field: string,
    form?: UntypedFormGroup
  ): { 'has-error': boolean } {
    return { 'has-error': this.isFieldValid(field, form) };
  }

  isFieldValid = (field: string, form?: FormGroup): boolean => {
    if (form) {
      return form.get(field)?.touched && form?.get(field)?.invalid
        ? true
        : false;
    }

    return this.form.get(field)?.touched && this.form?.get(field)?.invalid
      ? true
      : false;
  };

  validateAllFormFields(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
        this.handleFocusError(formGroup as FormGroup);
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof FormArray) {
        this.validateAllFormFields(control);
      }
    });
  }

  handleFocusError = (formGroup: FormGroup) => {
    Object.keys(formGroup.controls).forEach((field) => {
      const control: AbstractControl = formGroup.get(field) as AbstractControl;
      if (control.status === 'INVALID' && control.dirty) {
        document
          .getElementById(field)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  reset(): void {
    this.formData = null;
    this.formLoading = false;
    this.form.reset();
  }

  //  DESTROY SUBSCRIPTIONS
  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) =>
      subscription.unsubscribe()
    );
  }

  listenAddress(form: FormGroup) {
    form.get('zipCode')?.valueChanges.subscribe((zipCode) => {
      if (zipCode?.length == 8) return this.getAddress(form);
    });

    form.get('stateId')?.valueChanges.subscribe((stateId) => {
      const { name, uf } =
        this.states?.find((el: IState) => el?.id == stateId) || {};
      form.get('stateName')?.setValue(name);
      form.get('stateUf')?.setValue(uf);
      this.getCities(stateId, form);
    });

    form.get('cityId')?.valueChanges.subscribe((cityId) => {
      const { name } = this.cities.find((el: ICity) => el.id == cityId) || {};
      form.get('cityName')?.setValue(name);
    });
  }

  getAddress(form: FormGroup): void {
    const zipCode = form.get('zipCode')?.value as string;
    if (zipCode.length == 8)
      this.megaleiosService.getCEP(zipCode).subscribe((res) => {
        const {
          streetAddress,
          neighborhood,
          stateId,
          stateName,
          stateUf,
          cityId,
          cityName,
        } = res.data;

        form.patchValue({
          streetAddress,
          neighborhood,
          stateId,
          stateName,
          stateUf,
          cityId,
          cityName,
        });
      });
  }

  getStates(): void {
    this.megaleiosService.getStates().subscribe(({ data }) => {
      this.states = data;
    });
  }

  getCities(stateId: string, form: FormGroup): void {
    if (stateId)
      this.megaleiosService.getCities(stateId).subscribe(({ data }) => {
        this.cities = data;
        setTimeout(
          () => form.get('cityId')?.setValue(this.form?.value?.cityId),
          400
        );
      });
  }

  addValidators(
    field: string,
    validators: ValidatorFn[],
    form: FormGroup = this.form
  ) {
    form.get(field)?.addValidators(validators);
    form.get(field)?.updateValueAndValidity();
  }

  cleanValidators(field: string, form: FormGroup = this.form) {
    form.get(field)?.clearValidators();
    form.get(field)?.updateValueAndValidity();
  }

  removeValidators(
    field: string,
    validators: ValidatorFn[],
    form: FormGroup = this.form
  ) {
    form.get(field)?.removeValidators(validators);
    form.get(field)?.updateValueAndValidity();
    form.get(field)?.setValue(null);
  }

  compareItem(item1: T, item2: T): boolean {
    return item1 && item2 ? item1.id === item2.id : item1 === item2;
  }

  async getCodeCountries() {
    this.megaleiosService.getCountries().subscribe(({ data }) => {
      this.countries = data;
    });
  }
}
