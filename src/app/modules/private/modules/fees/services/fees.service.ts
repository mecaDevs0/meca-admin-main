import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { GlobalClass } from '@app/core/classes/global.class';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IFees } from '@app/core/interfaces/IFees';
import { enumToList } from '../../../../../core/functions/enumToList';

@Injectable({
  providedIn: 'root',
})
export class FeesService extends GlobalClass<IFees> {
  accessLevelName: EMenuItem = EMenuItem['Taxas'];
  uri: string = 'Fees';
  baseRoute: string = '/app/fees';
  breadCrumbTitle: string = 'Taxas';
  breadCrumbSubtitle: string = 'Taxa';

  loadForm() {
    this.restartForm();
    this.form = this.fb.group({
      id: [null],
      platformFee: [null, [Validators.required]],
    });

    this.patchValuesForm();
  }

  getItem(): any {
    this.detailsLoading = true;
    this.httpService.get(`${this.uri}`, false).subscribe(({ data }) => {
      this.formData = data;
      const rules = this.storage.get('rules');
      if (rules) {
        const ruleIndex = enumToList(EMenuItem).findIndex((menu: any) => {
          if (menu.name === EMenuItem[EMenuItem.Taxas]) {
            return menu;
          }
        });

        if (!rules[ruleIndex]?.edit) {
          this.form.disable();
        }
      }

      this.detailsLoading = false;
      this.patchValuesForm();
    });
  }

  edit(body: any): void {
    this.formLoading = true;
    this.httpService.patch(`${this.uri}`, body, true).subscribe(
      (_) => {
        this.formLoading = false;
      },
      (_) => {
        this.formLoading = false;
      }
    );
  }
}
