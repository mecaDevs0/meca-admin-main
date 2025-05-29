import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { GlobalClass } from '@classes/global.class';
import { EMenuItem } from '@core/enums/EMenuItem';
import { trimWhiteSpace } from '@functions/validators.function';
import { ActivatedRoute } from '@angular/router';
import { IFormDataModel } from '@app/core/interfaces/CORE/IFormDataModel';
import { IAccessLevel, IRule } from '@app/core/interfaces/CORE/IAccessLevel';
import { IAsideMenuConfig } from '@app/core/interfaces/CORE/IAsideMenuConfig';

@Injectable({
  providedIn: 'root',
})
export class AccessLevelService extends GlobalClass<IAccessLevel> {
  formDataModel: IFormDataModel = {
    columns: [
      {
        data: 'id',
        name: 'Id',
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
      column: '',
      direction: 'desc',
    },
  };

  accessLevelName: EMenuItem = EMenuItem['Perfis de acesso'];
  uri: string = 'AccessLevel';
  actionsMsg: string = 'este perfil de acesso';
  baseRoute: string = '/app/access-profiles';
  listTitle: string = `Todos os perfis de acesso`;
  breadCrumbTitle: string = 'Perfis de acesso';
  breadCrumbSubtitle: string = 'perfil de acesso';

  accessLevels: IAsideMenuConfig[] = this.asideMenuService.menuConfig;

  loadForm() {
    this.restartForm();
    this.form = this.fb.group({
      id: [null],
      name: [null, [trimWhiteSpace, Validators.required]],
      rules: [[], []],
    });

    this.patchValuesForm();
  }

  patchValuesForm() {
    if (this.formData) {
      this.form.patchValue(this.formData);
    } else {
      this.setRules();
    }
  }

  handleFormUpdate(activatedRoute: ActivatedRoute) {
    this.getItem(activatedRoute);
    if (this.formData) {
      this.form.patchValue(this.formData);
    }
  }

  setRules() {
    for (const ruleIndex in this.accessLevels) {
      this.form.get('rules')?.value.push(this.setRuleData(Number(ruleIndex)));
    }
  }

  setRuleData(ruleIndex: number) {
    return {
      menuItem: ruleIndex,
      access: true,
      edit: true,
      write: true,
      delete: true,
      enableDisable: true,
      export: true,
    };
  }

  resetRuleData(ruleIndex: number) {
    return {
      menuItem: ruleIndex,
      access: false,
      edit: false,
      write: false,
      delete: false,
      enableDisable: false,
      export: false,
    };
  }

  handleSetAccessLevel(event: Event) {
    const target = event.target as HTMLInputElement;
    const { value, checked, name: EMenuNumber } = target;

    if (value === 'access') {
      this.form.value.rules[EMenuNumber] = checked
        ? this.setRuleData(Number(EMenuNumber))
        : this.resetRuleData(Number(EMenuNumber));
    } else {
      this.form.value.rules[EMenuNumber] = {
        ...this.form.value.rules[EMenuNumber],
        [value]: checked,
      };
    }
  }

  handleShowOrHide(EMenuNumber: EMenuItem): boolean {
    return this.form
      .get('rules')
      ?.value?.find(
        (rule: IRule) => rule.menuItem === EMenuNumber && rule.access === true
      );
  }
}
