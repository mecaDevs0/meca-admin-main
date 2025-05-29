import { FormGroup, FormBuilder, FormArray, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AsideMenuService } from '@app/modules/private/components/aside-menu/services/aside-menu.service';
import { AlertService } from '@app/modules/shared/components/alert/alert.service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { HttpService } from '../../services/http/http.service';
import { MegaleiosService } from '../../services/megaleios/megaleios.service';
import { SessionService } from '../../services/session/session.service';
import { StorageService } from '../../services/storage/storage.service';
import { ICity } from './ICity';
import { IListCountry } from './IListCountry';
import { IState } from './IState';
import { Location } from '@angular/common';
import { EMenuItem } from '../../enums/EMenuItem';
import { IFormDataModel } from './IFormDataModel';
import { EButtonsHidden } from '../../enums/CRUD/EButtonsHidden';
import { EBlockedName } from '../../enums/CRUD/EBlockedName';

export interface IGlobalClass<T> {
  uri: string;
  accessLevelName: EMenuItem | null;
  formDataModel: IFormDataModel;
  subscriptions: Subscription[];
  form: FormGroup;
  listSearchForm: FormGroup;
  list: T[];
  listSelected: T[];
  states: IState[];
  cities: ICity[];
  countries: IListCountry[];
  formData: T | null;
  baseRef: string;
  actionsMsg: string;
  listName: string;
  baseRoute: string;
  listTitle: string;
  detailsTitle: string;
  breadCrumbTitle: string;
  breadCrumbSubtitle: string;
  listSize: number;
  listSizeFiltered: number;
  listLoading: boolean;
  exportLoading: boolean;
  downloadLoading: boolean;
  registerLoading: boolean;
  detailsLoading: boolean;
  formLoading: boolean;
  formErrors: boolean;
  byFilter: boolean;
  router: Router;
  httpService: HttpService<T>;
  alertService: AlertService;
  location: Location;
  fb: FormBuilder;
  storage: StorageService;
  session: SessionService;
  megaleiosService: MegaleiosService;
  asideMenuService: AsideMenuService;
  authenticationService: AuthenticationService;
  readOnInit(activatedRoute: ActivatedRoute): void;
  loadFilter(): void;
  listenFilter(): void;
  updateQueryParams(params: Params): void;
  handleListSearchChange(value: Params): void;
  handleListOrderChange(value: Params): void;
  handleListPageChange(value: Params): void;
  getList(): void;
  setQueryParams(params: Params): void;
  handleMethodExport(): void;
  handleExportItemsSelected(item: T | null): void;
  handleDownloadModel(): void;
  handleBatchRegistration(event: Event): void;
  exportToExcel(): void;
  handleListItemSelected(value: T): void;
  handleBlockUnblock(event: Event, index?: number): Promise<void>;
  handleDelete(item: T, back?: boolean): Promise<void>;
  isChecked(item: T): boolean;
  handleSelectAll(): void;
  loadForm(): void;
  restartForm(): void;
  patchValuesForm(): void;
  getItem(activatedRoute: ActivatedRoute): void;
  edit(body: T): void;
  store(body: T, route?: string): void;
  handleSubmit(): void;
  displayFieldCss(field: string, form?: FormGroup): { 'has-error': boolean };
  isFieldValid(field: string, form?: FormGroup): boolean;
  validateAllFormFields(formGroup: FormGroup | FormArray): void;
  handleFocusError(formGroup: FormGroup): void;
  reset(): void;
  listenAddress(form: FormGroup): void;
  getStates(): void;
  getCities(stateId: string, form: FormGroup): void;
  addValidators(
    field: string,
    validators: ValidatorFn[],
    form?: FormGroup
  ): void;
  cleanValidators(field: string, form?: FormGroup): void;
  removeValidators(
    field: string,
    validators: ValidatorFn[],
    form?: FormGroup
  ): void;
  compareItem(item1: T, item2: T): boolean;
  getCodeCountries(): Promise<void>;
}
