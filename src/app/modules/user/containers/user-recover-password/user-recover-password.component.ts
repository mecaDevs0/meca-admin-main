import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { GlobalClass } from '@app/core/classes/global.class';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IProfile } from '@app/core/interfaces/IProfile';

@Component({
  selector: 'app-user-recover-password',
  templateUrl: './user-recover-password.component.html',
  styleUrls: ['./user-recover-password.component.scss'],
})
export class UserRecoverPasswordComponent extends GlobalClass<IProfile> {
  formIsSend: boolean = false;
  uri: string = 'Profile';
  accessLevelName: EMenuItem | null = null;

  ngOnInit() {
    this.loadForm();
  }

  loadForm() {
    this.formData = null;
    this.formErrors = false;
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
    });

    this.patchValuesForm();
  }

  handleSubmit(): void {
    this.formLoading = true;
    if (this.form.valid) {
      this.handleForgotPassword();
    } else {
      this.validateAllFormFields(this.form);
      this.formLoading = false;
    }
  }

  handleForgotPassword = () => {
    this.httpService
      .post(`${this.uri}/ForgotPassword`, this.form.value)
      .subscribe(
        (_) => {
          this.formIsSend = true;
          this.formLoading = false;
          this.formErrors = false;
          this.reset();
        },
        (error) => (this.formLoading = false)
      );
  };
}
