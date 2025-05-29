import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { trimWhiteSpace } from '@functions/validators.function';
import { HttpService } from '@services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalClass } from '@app/core/classes/global.class';
import { Location } from '@angular/common';
import { MegaleiosService } from '@app/core/services/megaleios/megaleios.service';
import { SessionService } from '@app/core/services/session/session.service';
import { StorageService } from '@app/core/services/storage/storage.service';
import { AsideMenuService } from '@app/modules/private/components/aside-menu/services/aside-menu.service';
import { AlertService } from '@app/modules/shared/components/alert/alert.service';
import { AuthenticationService } from '@app/core/services/authentication/authentication.service';
import { IUserAdministrator } from '@app/core/interfaces/IUserAdministrator';
import { EMenuItem } from '@app/core/enums/EMenuItem';
import { IToken } from '@app/core/interfaces/CORE/IToken';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends GlobalClass<IUserAdministrator> {
  redirectTo!: string;
  uri: string = 'UserAdministrator';
  accessLevelName: EMenuItem | null = null;

  constructor(
    public router: Router,
    public httpService: HttpService<IToken>,
    public alertService: AlertService,
    public location: Location,
    public fb: FormBuilder,
    public storage: StorageService,
    public session: SessionService,
    public megaleiosService: MegaleiosService,
    public asideMenuService: AsideMenuService,
    public authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute
  ) {
    super(
      router,
      httpService,
      alertService,
      location,
      fb,
      storage,
      session,
      megaleiosService,
      asideMenuService,
      authenticationService
    );
  }

  ngOnInit(): void {
    this.loadForm();

    this.activatedRoute.queryParams.subscribe(
      (params) => (this.redirectTo = params['redirectTo'])
    );
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
        localStorage.clear();
        sessionStorage.clear();
        this.authenticationService.setAuthentication(data);
        await this.asideMenuService.getUser();

        setTimeout(async () => {
          this.asideMenuService.handleNavigate(this.redirectTo);
          this.formLoading = false;
        }, 500);
      },
      (_) => {
        this.formLoading = false;
      }
    );
  }
}
