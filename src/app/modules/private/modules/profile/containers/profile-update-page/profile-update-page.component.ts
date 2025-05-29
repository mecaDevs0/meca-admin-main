import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { GlobalClass } from '@app/core/classes/global.class';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { trimWhiteSpace } from '@app/core/functions/validators.function';
import { IUserAdministrator } from '@app/core/interfaces/IUserAdministrator';

@Component({
  selector: 'app-profile-update-page',
  templateUrl: './profile-update-page.component.html',
  styleUrls: ['./profile-update-page.component.scss'],
})
export class ProfileUpdatePageComponent extends GlobalClass<IUserAdministrator> {
  uri: string = 'UserAdministrator';
  accessLevelName: EMenuItem | null = null;

  ngOnInit(): void {
    this.loadForm();
    setTimeout(() => {
      this.loadForm();
    }, 1000);
  }

  loadForm(): void {
    this.form = this.fb.group({
      id: [this.asideMenuService?.user?.id],
      name: [
        this.asideMenuService?.user?.name,
        [trimWhiteSpace, Validators.required],
      ],
      email: [
        this.asideMenuService?.user?.email,
        [Validators.required, Validators.email],
      ],
    });
  }

  handleSubmit(): void {
    if (this.formLoading === false) {
      this.formLoading = true;
      if (this.form.valid) {
        this.formErrors = false;
        this.edit(this.form.value);
      } else {
        this.validateAllFormFields(this.form);
        this.formLoading = false;
        this.formErrors = true;
      }
    }
  }

  edit(body: IUserAdministrator): void {
    this.formLoading = true;
    this.httpService
      .patch(`${this.uri}/${this.form.value?.id}`, body, true)
      .subscribe(
        (_) => {
          this.asideMenuService.getUser();
          this.formLoading = false;
          this.handleBack();
        },
        (_) => (this.formLoading = false)
      );
  }

  handleBack = () => {
    this.location.back();
  };
}
