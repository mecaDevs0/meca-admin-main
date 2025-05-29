import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../core/services/http/http.service';
import { CONFIG_BASE } from '@app/core/config';
import { AlertService } from '../../../shared/components/alert/alert.service';
import { Location } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IProfile } from '@app/core/interfaces/IProfile';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss',
})
export class UserHomeComponent {
  title: string = CONFIG_BASE.appName;
  userData!: IProfile;
  loading: boolean = false;

  form!: FormGroup;
  messageError!: string;
  confirmPassword: FormControl = new FormControl('');
  formLoading: boolean = false;

  formUser!: FormGroup;
  userFormLoading: boolean = false;

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private httpService: HttpService<IProfile>,
    private router: Router,
    private alertService: AlertService
  ) {
    this.loadForm();
    this.loadUserForm();
  }

  async ngOnInit() {
    this.userData = await this.getUserLogged();
    this.formUser.patchValue(this.userData);
  }

  handleLogout = () => {
    sessionStorage.removeItem('sessionUserApp');
    this.router.navigate(['/user/login']);
  };

  getUserLogged = (): Promise<IProfile> => {
    return new Promise((resolve) => {
      this.httpService.get('Profile/GetInfo').subscribe(({ data }) => {
        resolve(data);
      });
    });
  };

  async handleDeleteAccount() {
    const confirm = await this.alertService.alert(
      'Tem certeza que deseja excluir?'
    );

    if (confirm) {
      this.loading = true;

      this.httpService.delete(`Profile/${this.userData?.id}`, true).subscribe(
        ({ data }) => {
          this.loading = false;
          this.handleLogout();
        },
        (error) => {
          this.loading = false;
        }
      );
    }
  }

  loadForm() {
    this.form = this.formBuilder.group({
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
      .post('Profile/ChangePassword', this.form.value, true)
      .subscribe(
        ({ data }) => {
          this.formLoading = false;
        },
        (error) => {
          this.formLoading = false;
        }
      );
  }

  handleBack = () => {
    this.location.back();
  };

  validateAllFormFields(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
        this.handleFocusError();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      } else if (control instanceof FormArray) {
        this.validateAllFormFields(control);
      }
    });
  }

  handleFocusError = () => {
    Object.keys(this.form.controls).forEach((field) => {
      const control: AbstractControl = this.form.get(field) as AbstractControl;
      if (control.status === 'INVALID' && control.dirty) {
        document
          .getElementById(field)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  loadUserForm() {
    this.formUser = this.formBuilder.group({
      id: [null],
      fullName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null],
      photo: [null],
    });
  }

  displayFieldCss(field: string, form?: FormGroup): { 'has-error': boolean } {
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

  handleEditUser() {
    this.userFormLoading = true;
    this.httpService
      .post(`Profile/Update`, this.formUser.value, true)
      .subscribe(
        ({ data }) => {
          this.userFormLoading = false;
        },
        (error) => {
          this.userFormLoading = false;
        }
      );
  }
}
