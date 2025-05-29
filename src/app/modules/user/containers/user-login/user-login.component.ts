import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { trimWhiteSpace } from '@functions/validators.function';
import { GlobalClass } from '@app/core/classes/global.class';
import { IProfile } from '@app/core/interfaces/IProfile';
import { IToken } from '@app/core/interfaces/CORE/IToken';
import { EMenuItem } from '@app/core/enums/EMenuItem';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent extends GlobalClass<IProfile> {
  redirectTo!: string;
  uri: string = 'Profile';
  accessLevelName: EMenuItem | null = null;

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm() {
    this.formData = null;
    this.formErrors = false;
    this.form = this.fb.group({
      email: ['', [trimWhiteSpace, Validators.required, Validators.email]],
      password: ['', [trimWhiteSpace, Validators.required]],
    });
  }

  handleSubmit(): void {
    this.formLoading = true;
    this.httpService.post(`${this.uri}/Token`, this.form.value).subscribe(
      async ({ data }) => {
        sessionStorage.clear();

        setTimeout(() => {
          this.authenticationService.setAuthentication(data, 'sessionUserApp');
          this.router.navigate(['user/home']);
          this.formLoading = false;
        }, 600);
      },
      (_) => {
        this.formLoading = false;
      }
    );
  }
}
