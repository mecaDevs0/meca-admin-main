import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { GlobalClass } from '@app/core/classes/global.class';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IUserAdministrator } from '@app/core/interfaces/IUserAdministrator';

@Component({
  selector: 'app-profile-password-update-page',
  templateUrl: './profile-password-update-page.component.html',
  styleUrls: ['./profile-password-update-page.component.scss'],
})
export class ProfilePasswordUpdatePageComponent extends GlobalClass<IUserAdministrator> {
  messageError!: string;
  confirmPassword: FormControl = new FormControl('');
  uri: string = 'UserAdministrator';
  accessLevelName: EMenuItem | null = null;

  ngOnInit() {
    this.loadForm();
  }

  loadForm() {
    this.form = this.fb.group({
      currentPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required, Validators.minLength(6)]],
    });
  }

  handleSubmit(): void {
    if (this.formLoading === false) {
      this.formLoading = true;
      if (this.form.valid) {
        this.handlePasswordMatch();
      } else {
        this.validateAllFormFields(this.form);
        this.formLoading = false;
      }
    }
  }

  handlePasswordMatch = () => {
    if (this.form?.value?.newPassword === this.confirmPassword?.value) {
      this.messageError = '';
      this.updatePassword();
    } else {
      this.messageError = 'Senhas não conferem!';
      this.formLoading = false;
    }
  };

  updatePassword() {
    this.httpService
      .post(`${this.uri}/ChangePassword`, this.form.value, true)
      .subscribe(
        ({ data }) => {
          this.formLoading = false;
          this.location.back();
        },
        (error) => {
          this.formLoading = false;
        }
      );
  }

  handleBack = () => {
    this.location.back();
  };
}
